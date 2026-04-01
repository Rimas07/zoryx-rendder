"use client";

import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";

interface Props {
  specializations: string[];
  clinics: { id: string; name: string; specializations: string[]; languages: string[]; address: string }[];
  onSpecializationSelect?: (spec: string) => void;
  onClinicSelect?: (id: string) => void;
}

export function ChatBot({ specializations, clinics, onSpecializationSelect, onClinicSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<
    { role: "user" | "bot"; text: string }[]
  >([
    {
      role: "bot",
      text: "👋 Привет! Опишите ваши симптомы, и я помогу найти нужного врача.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, specializations, clinics }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "bot", text: data.answer }]);

      // Применяем специализацию
      const specMatch = data.answer.match(
        /Рекомендуемая специализация:\s*\*?\*?([^\n*]+)/
      );
      if (specMatch && onSpecializationSelect) {
        const spec = specializations.find((s) =>
          s.toLowerCase().includes(specMatch[1].trim().toLowerCase())
        );
        if (spec) onSpecializationSelect(spec);
      }

      // Открываем рекомендуемую клинику
      const clinicMatch = data.answer.match(
        /Рекомендуемая клиника:\s*\*?\*?([^\n*]+)/
      );
      if (clinicMatch && onClinicSelect) {
        const clinicName = clinicMatch[1].trim().toLowerCase();
        const found = clinics.find((c) =>
          c.name.toLowerCase().includes(clinicName) ||
          clinicName.includes(c.name.toLowerCase())
        );
        if (found) onClinicSelect(found.id);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Ошибка соединения. Попробуйте ещё раз." },
      ]);
    }
    setLoading(false);
  };

  return (
    <>
      {/* Кнопка открытия */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-[#622ADA] to-[#0070BB] text-white shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity"
      >
        <MessageCircle size={26} />
      </button>

      {/* Чат окно */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[340px] bg-white rounded-2xl shadow-2xl border border-[#e2dff5] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#622ADA] to-[#0070BB] px-4 py-3 flex items-center justify-between">
            <div>
              <div className="text-white font-semibold text-sm">Zoryx AI</div>
              <div className="text-white/70 text-xs">
                Помогу найти нужного врача
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
                  Думаю...
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
              placeholder="Опишите симптомы..."
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
