import { GoogleGenAI } from "@google/genai";
import { supabaseAdmin } from "@/lib/supabase";
import { buildSystemPrompt } from "@/lib/prompts";

// Edge Runtimeは一部ライブラリの互換性の問題があるためNode.jsランタイムを使用
// export const runtime = "edge";

const EMBEDDING_MODEL = "gemini-embedding-001";
const CHAT_MODEL = "gemini-3.1-flash-lite-preview";
const EMBEDDING_DIMENSIONS = 768;

type ChatRequest = {
  message: string;
  session_id: string;
  municipality_id?: string;
  history?: { role: "user" | "assistant"; content: string }[];
};

function sseEvent(type: string, content: unknown): string {
  return `data: ${JSON.stringify({ type, content })}\n\n`;
}

export async function POST(request: Request) {
  const encoder = new TextEncoder();

  try {
    // リクエストバリデーション
    const body: ChatRequest = await request.json();
    if (!body.message || !body.session_id) {
      return new Response(
        JSON.stringify({ error: "message と session_id は必須です" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { message, session_id, municipality_id, history = [] } = body;

    // Gemini クライアント
    const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

    // 1. 利用制限チェック
    const { data: limitResult } = await supabaseAdmin.rpc("check_usage_limit", {
      p_session_id: session_id,
    });

    if (limitResult && !limitResult.allowed) {
      const stream = new ReadableStream({
        start(controller) {
          const reason =
            limitResult.reason === "monthly_site_limit_exceeded"
              ? "ただいまメンテナンス中です。飯田市の公式サイト（https://www.city.iida.lg.jp）から直接お探しください。"
              : "今日はたくさんご質問いただきありがとうございます！また明日お気軽にどうぞ。飯田市の公式サイト（https://www.city.iida.lg.jp）からも直接お探しいただけます。";
          controller.enqueue(encoder.encode(sseEvent("error", reason)));
          controller.enqueue(encoder.encode(sseEvent("done", "")));
          controller.close();
        },
      });
      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    // 2. ユーザー質問のEmbedding化
    const startTime = Date.now();
    const embeddingResult = await genai.models.embedContent({
      model: EMBEDDING_MODEL,
      contents: message,
      config: {
        taskType: "QUESTION_ANSWERING",
        outputDimensionality: EMBEDDING_DIMENSIONS,
      },
    });
    const queryEmbedding = embeddingResult.embeddings?.[0]?.values;
    if (!queryEmbedding) {
      throw new Error("Embedding生成に失敗しました");
    }

    // 3. ベクトル検索
    const { data: matchedPages, error: matchError } = await supabaseAdmin.rpc(
      "match_pages",
      {
        query_embedding: JSON.stringify(queryEmbedding),
        match_threshold: 0.3,
        match_count: 5,
        p_municipality_id: municipality_id || null,
      }
    );

    if (matchError) {
      throw new Error(`ベクトル検索エラー: ${matchError.message}`);
    }

    const pages = matchedPages || [];

    // 3.5 検索ヒットなし時のフォールバック
    if (pages.length === 0) {
      const noHitStream = new ReadableStream({
        start(controller) {
          const msg =
            "すみません、その情報はまだ私のデータにないんです。飯田市の公式サイト（https://www.city.iida.lg.jp）で直接お探しいただくか、市役所（0265-22-4511）にお電話でお問い合わせください。";
          controller.enqueue(encoder.encode(sseEvent("text", msg)));
          controller.enqueue(encoder.encode(sseEvent("done", "")));
          controller.close();
        },
      });
      return new Response(noHitStream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    // 4. システムプロンプト構築
    const systemPrompt = buildSystemPrompt(pages);

    // 5. 会話履歴構築（直近10往復）
    const recentHistory = history.slice(-20);
    const contents = [
      ...recentHistory.map((h) => ({
        role: h.role === "user" ? ("user" as const) : ("model" as const),
        parts: [{ text: h.content }],
      })),
      { role: "user" as const, parts: [{ text: message }] },
    ];

    // sources/spots情報を事前に構築
    const sources = pages.map(
      (p: { source_url: string; title: string; category: string }) => ({
        url: p.source_url,
        title: p.title,
        municipality_name: "飯田市",
      })
    );

    const spots = pages
      .filter(
        (p: { metadata: { department?: string } }) => p.metadata?.department
      )
      .map(
        (p: {
          metadata: { department?: string; phone?: string };
          source_url: string;
        }) => ({
          department: p.metadata.department,
          phone: p.metadata.phone || "",
        })
      )
      .filter(
        (
          spot: { department: string; phone: string },
          index: number,
          self: { department: string; phone: string }[]
        ) => self.findIndex((s) => s.department === spot.department) === index
      );

    // 6. ストリーミングレスポンス
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await genai.models.generateContentStream({
            model: CHAT_MODEL,
            contents,
            config: {
              systemInstruction: systemPrompt,
              temperature: 0.3,
              maxOutputTokens: 2048,
            },
          });

          for await (const chunk of response) {
            const text = chunk.text;
            if (text) {
              controller.enqueue(encoder.encode(sseEvent("text", text)));
            }
          }

          // sources イベント
          if (sources.length > 0) {
            controller.enqueue(encoder.encode(sseEvent("sources", sources)));
          }

          // spots イベント
          if (spots.length > 0) {
            controller.enqueue(encoder.encode(sseEvent("spots", spots)));
          }

          // done イベント
          controller.enqueue(encoder.encode(sseEvent("done", "")));

          // 使用ログ記録（バックグラウンド）
          const responseTime = Date.now() - startTime;
          try {
            await supabaseAdmin.rpc("log_ai_usage", {
              p_session_id: session_id,
              p_municipality_id: municipality_id || null,
              p_query: message,
              p_token_input: null,
              p_token_output: null,
              p_matched_pages: JSON.stringify(
                pages.map(
                  (p: { source_url: string }) => p.source_url
                )
              ),
              p_response_time_ms: responseTime,
            });
          } catch (logErr) {
            console.error("Usage log error:", logErr);
          }
        } catch (err) {
          const errorMessage =
            "申し訳ありません、ただいま混み合っています。飯田市の公式サイト（https://www.city.iida.lg.jp）から直接お探しください。";
          controller.enqueue(encoder.encode(sseEvent("error", errorMessage)));
          controller.enqueue(encoder.encode(sseEvent("done", "")));
          console.error("Chat stream error:", err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error("Chat API error:", err);
    return new Response(
      JSON.stringify({
        error: "サーバーエラーが発生しました",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
