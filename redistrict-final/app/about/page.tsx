"use client";
import AnimatedSection from "@/components/ui/AnimatedSection";
import Link from "next/link";
import { useLang } from "@/lib/lang";

const values = {
  en: [
    { title: "Individuality", description: "Every watch we offer is different. Different history, different wear, different character. There is no standard." },
    { title: "Craftsmanship", description: "We work with certified watchmakers and independent craftspeople. Quality is non-negotiable." },
    { title: "Restoration", description: "We believe in preserving what already exists rather than replacing it. A worn bezel has a story. We respect that." },
    { title: "Culture", description: "Watches are cultural objects. We approach them as such — with the respect they deserve and the curiosity they inspire." },
  ],
  ru: [
    { title: "Индивидуальность", description: "Каждые наши часы уникальны. Разная история, разный износ, разный характер. Стандарта нет." },
    { title: "Мастерство", description: "Мы работаем с сертифицированными часовщиками и независимыми мастерами. Качество — не обсуждается." },
    { title: "Реставрация", description: "Мы верим в сохранение того, что уже существует, а не в замену. Потёртый безель хранит историю. Мы её уважаем." },
    { title: "Культура", description: "Часы — это культурные объекты. Мы относимся к ним соответственно — с уважением и любопытством." },
  ],
};

export default function AboutPage() {
  const { t } = useLang();
  const vals = t(values.en, values.ru) as typeof values.en;

  return (
    <div className="min-h-screen bg-black">
      {/* Hero */}
      <section className="relative h-[70vh] min-h-[500px] flex items-end overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=1600&q=80')",
            filter: "brightness(0.3) grayscale(0.3)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
        <div className="relative z-10 px-6 md:px-12 pb-16 md:pb-24 w-full max-w-screen-xl mx-auto">
          <p className="text-[10px] tracking-[0.4em] uppercase text-zinc-600 font-mono mb-4">
            {t("About RE:DISTRICT", "О RE:DISTRICT")}
          </p>
          <h1 className="font-display text-6xl md:text-8xl font-light leading-none text-white">
            {t("Independent.", "Независимые.")}
            <br />
            <span className="italic">{t("Intentional.", "Осознанные.")}</span>
          </h1>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24 md:py-36 px-6 md:px-12 border-b border-white/5">
        <div className="max-w-screen-xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <AnimatedSection>
            <p className="text-[10px] tracking-[0.4em] uppercase text-zinc-600 font-mono mb-6">
              {t("Who We Are", "Кто мы")}
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-light leading-snug mb-0">
              {t("We are not a marketplace.", "Мы не маркетплейс.")}
              <br />
              <span className="italic text-zinc-400">
                {t("We are a perspective.", "Мы — точка зрения.")}
              </span>
            </h2>
          </AnimatedSection>

          <AnimatedSection delay={0.2} className="space-y-6 pt-12 lg:pt-16">
            <p className="text-sm text-zinc-400 leading-relaxed">
              {t(
                "RE:DISTRICT began with a simple observation: the most interesting watches are never the newest ones. They are the ones with decades of wear, unique dial patina, and custom modifications that make them entirely personal.",
                "RE:DISTRICT начался с простого наблюдения: самые интересные часы никогда не бывают новейшими. Это те, что с десятилетиями носки, уникальной патиной циферблата и кастомными модификациями, делающими их полностью личными."
              )}
            </p>
            <p className="text-sm text-zinc-400 leading-relaxed">
              {t(
                "We source watches from estate collections, private owners, and trusted dealers across Europe and Japan. Every piece passes through our hands before it reaches yours. We document it, assess it, restore it where needed, and tell its story honestly.",
                "Мы находим часы в частных коллекциях, у личных владельцев и у проверенных дилеров по всей Европе и Японии. Каждый экземпляр проходит через наши руки. Мы его документируем, оцениваем, реставрируем при необходимости и честно рассказываем его историю."
              )}
            </p>
            <p className="text-sm text-zinc-400 leading-relaxed">
              {t(
                "Some of what we offer has been restored. Some has been customized. Some is simply rare and beautiful and needed to be found by the right person. All of it has been chosen with care.",
                "Часть нашего предложения отреставрирована. Часть — кастомизирована. Часть просто редкая и красивая — ей нужно было найти своего человека. Всё выбрано с умом."
              )}
            </p>
            <p className="text-sm text-zinc-300 leading-relaxed font-display text-base italic">
              {t(
                "\"Time is the same for everyone. Watches are not.\"",
                "«Время одинаково для каждого. Часы — нет.»"
              )}
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 md:py-36 px-6 md:px-12 border-b border-white/5">
        <div className="max-w-screen-xl mx-auto">
          <AnimatedSection className="mb-16">
            <p className="text-[10px] tracking-[0.4em] uppercase text-zinc-600 font-mono mb-4">
              {t("What We Stand For", "Наши ценности")}
            </p>
            <h2 className="font-display text-5xl md:text-6xl font-light leading-none">
              {t("Values.", "Ценности.")}
            </h2>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5">
            {vals.map((v, i) => (
              <AnimatedSection key={i} delay={i * 0.1} className="bg-black p-8 md:p-12">
                <h3 className="font-display text-3xl font-light text-white mb-4">{v.title}</h3>
                <div className="w-8 h-px bg-white/20 mb-4" />
                <p className="text-sm text-zinc-500 leading-relaxed">{v.description}</p>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="py-24 md:py-36 px-6 md:px-12 border-b border-white/5">
        <div className="max-w-screen-xl mx-auto max-w-3xl">
          <AnimatedSection>
            <p className="text-[10px] tracking-[0.4em] uppercase text-zinc-600 font-mono mb-6">
              {t("The Future", "Будущее")}
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-light leading-snug mb-8">
              {t("Today: curated, restored, custom.", "Сегодня: подбор, реставрация, кастом.")}
              <br />
              <span className="italic text-zinc-400">
                {t("Tomorrow: original.", "Завтра: оригинальное.")}
              </span>
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed mb-6">
              {t(
                "RE:DISTRICT is building toward something larger. Our long-term vision is to develop original watch designs — pieces conceived entirely in-house, manufactured in limited quantities, and built to the same standard we hold every watch we handle.",
                "RE:DISTRICT движется к чему-то большему. Наша долгосрочная цель — разработать оригинальные дизайны часов: концепции, созданные целиком внутри бренда, выпущенные ограниченным тиражом, по тому же стандарту, которому мы подвергаем каждые часы."
              )}
            </p>
            <p className="text-sm text-zinc-400 leading-relaxed">
              {t(
                "That takes time. In the meantime, we focus on what we do best: finding extraordinary watches, giving them the attention they deserve, and placing them with people who will appreciate them.",
                "На это нужно время. Пока что мы сосредоточены на том, что умеем лучше всего: находить исключительные часы, уделять им должное внимание и передавать людям, которые их оценят."
              )}
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32 px-6 md:px-12">
        <div className="max-w-screen-xl mx-auto text-center">
          <AnimatedSection>
            <h2 className="font-display text-5xl md:text-7xl font-light mb-8">
              {t("Ready to find", "Готов найти")}
              <br />
              <span className="italic">
                {t("your watch?", "свои часы?")}
              </span>
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/shop" className="text-xs tracking-[0.3em] uppercase bg-white text-black hover:bg-zinc-200 px-10 py-4 transition-colors">
                {t("Browse the Shop", "Смотреть каталог")}
              </Link>
              <Link href="/contact" className="text-xs tracking-[0.3em] uppercase border border-white/20 hover:border-white/60 text-white px-10 py-4 transition-all">
                {t("Custom Order", "Кастом-заказ")}
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
