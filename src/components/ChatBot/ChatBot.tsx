"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { MessageCircle, X, Send } from "lucide-react";
import { useLang } from "../../contexts/LangContext";
interface Props {
  specializations: string[];
  activeLangs: string[];
  activeDistrict: string | null;
  onSpecializationSelect?: (spec: string) => void;
  onClinicSelect?: (id: string) => void;
}

export function ChatBot({ specializations, activeLangs, activeDistrict, onSpecializationSelect, onClinicSelect }: Props) {
  const [open, setOpen] = useState(false);
  const { t, lang } = useLang();
  const btnRef = useRef<HTMLButtonElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  // Pulse animation on the chat button
  useEffect(() => {
    if (!btnRef.current || open) return;
    const tween = gsap.to(btnRef.current, {
      scale: 1.12,
      duration: 0.7,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut',
    });
    return () => { tween.kill(); gsap.set(btnRef.current, { scale: 1 }); };
  }, [open]);

  // Animate chat window appearing
  useEffect(() => {
    if (!open || !chatRef.current) return;
    gsap.fromTo(chatRef.current,
      { opacity: 0, y: 16, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 0.28, ease: 'power2.out' }
    );
  }, [open]);
   
  const [messages, setMessages] = useState<{ role: "user" | "bot"; text: string }[]>(() => {
    try {
      const saved = sessionStorage.getItem("zoryx_chat");
      return saved ? JSON.parse(saved) : [{ role: "bot", text: t("chatGreeting") }];
    } catch {
      return [{ role: "bot", text: t("chatGreeting") }];
    }
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Сохраняем историю при каждом изменении
  useEffect(() => {
    sessionStorage.setItem("zoryx_chat", JSON.stringify(messages));
  }, [messages]);

  // При смене языка всегда сбрасываем чат
  useEffect(() => {
    setMessages([{ role: "bot", text: t("chatGreeting") }]);
    sessionStorage.removeItem("zoryx_chat");
  }, [lang]);
  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);

    try {
      const history = messages
        .filter((m) => m.role !== "bot" || m.text !== t("chatGreeting"))
        .map((m) => ({
          role: m.role === "user" ? "user" : "assistant",
          content: m.text,
        }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, history, lang, activeLangs, activeDistrict }),
      });

      if (!res.ok || !res.body) {
        setMessages((prev) => [...prev, { role: "bot", text: t("chatError") }]);
        setLoading(false);
        return;
      }

      // Добавляем пустое сообщение бота — будем дополнять по мере стриминга
      setLoading(false);
      setMessages((prev) => [...prev, { role: "bot", text: "" }]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        if (chunk.includes('__META__')) {
          // Последний чанк содержит метаданные
          const splitIdx = chunk.indexOf('__META__');
          buffer += chunk.slice(0, splitIdx);

          const cleanText = buffer
            .replace(/\*?\*?Рекомендуемая специализация:[^\n]*/g, '')
            .replace(/\*?\*?Рекомендуемая клиника:[^\n]*/g, '')
            .trim();

          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: "bot", text: cleanText };
            return updated;
          });

          try {
            const meta = JSON.parse(chunk.slice(splitIdx + 8).trim());
            if (meta.clinicId && onClinicSelect) onClinicSelect(meta.clinicId);
            if (meta.specKey && onSpecializationSelect) {
              const spec = specializations.find((s) =>
                s.toLowerCase().replace(/_/g, ' ').includes(
                  (meta.specKey as string).toLowerCase().replace(/_/g, ' ')
                )
              );
              if (spec) onSpecializationSelect(spec);
            }
          } catch { /* некорректный JSON метаданных — игнорируем */ }
        } else {
          // Обычный текстовый чанк — дописываем в сообщение.
          // Обрезаем всё начиная с мета-строк (они всегда в конце ответа GPT)
          buffer += chunk;
          const metaIdx = buffer.search(/\n\*{0,2}Рекомендуемая\s/);
          const displayText = metaIdx >= 0 ? buffer.slice(0, metaIdx).trim() : buffer;
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: "bot", text: displayText };
            return updated;
          });
        }
      }
    } catch {
      setMessages((prev) => [...prev, { role: "bot", text: t("chatError") }]);
      setLoading(false);
    }
  };

  return (
    <>
      {/* Кнопка открытия */}
      <button
        ref={btnRef}
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-[#622ADA] to-[#0070BB] text-white shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity"
      >
        <MessageCircle size={26} />
      </button>

      {/* Чат окно */}
      {open && (
        <div ref={chatRef} className="fixed bottom-24 right-6 z-50 w-[340px] bg-white rounded-2xl shadow-2xl border border-[#e2dff5] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#622ADA] to-[#0070BB] px-4 py-3 flex items-center justify-between">
            <div>
              <div className="text-white font-semibold text-sm">Zoryx AI</div>
              <div className="text-white/70 text-xs">
                {t("chatSubtitle")}
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white/80 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[360px]">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={[
                    "max-w-[80%] px-3 py-2 rounded-2xl text-[13px] leading-relaxed whitespace-pre-wrap",
                    msg.role === "user"
                      ? "bg-gradient-to-br from-[#622ADA] to-[#0070BB] text-white rounded-br-sm"
                      : "bg-[#f0eef8] text-[#1a1535] rounded-bl-sm",
                  ].join(" ")}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-[#f0eef8] px-3 py-2 rounded-2xl rounded-bl-sm text-[13px] text-[#9d99c0]">
                  {t("chatThinking")}
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-[#e2dff5] flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder={t("chatInputPlaceholder")}
              className="flex-1 text-[13px] bg-[#f0eef8] rounded-xl px-3 py-2 outline-none border border-transparent focus:border-[#622ADA]"
            />
            <button
              onClick={send}
              disabled={loading}
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#622ADA] to-[#0070BB] text-white flex items-center justify-center hover:opacity-90 disabled:opacity-50"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
