"use client";
import { useState, useMemo, Suspense } from "react";
import { motion } from "framer-motion";
import WatchCard from "@/components/ui/WatchCard";
import { watches, WatchCategory } from "@/lib/data";
import { useSearchParams } from "next/navigation";
import { useLang } from "@/lib/lang";

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = (searchParams.get("category") as WatchCategory) || "all";
  const [activeCategory, setActiveCategory] = useState<WatchCategory | "all">(initialCategory);
  const [sort, setSort] = useState("default");
  const [search, setSearch] = useState("");
  const { t } = useLang();

  const categories = [
    { value: "all" as const, en: "All Watches", ru: "Все часы" },
    { value: "custom" as const, en: "Custom", ru: "Кастом" },
    { value: "restored" as const, en: "Restored", ru: "Реставрация" },
    { value: "curated" as const, en: "Curated", ru: "Подбор" },
  ];

  const sortOptions = [
    { value: "default", en: "Featured", ru: "Избранное" },
    { value: "price-asc", en: "Price: Low to High", ru: "Цена: от низкой" },
    { value: "price-desc", en: "Price: High to Low", ru: "Цена: от высокой" },
    { value: "year-asc", en: "Year: Oldest", ru: "Год: сначала старые" },
    { value: "year-desc", en: "Year: Newest", ru: "Год: сначала новые" },
  ];

  const filtered = useMemo(() => {
    let list = [...watches];
    if (activeCategory !== "all") list = list.filter((w) => w.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (w) => w.name.toLowerCase().includes(q) || w.brand.toLowerCase().includes(q) || w.tagline.toLowerCase().includes(q)
      );
    }
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    if (sort === "year-asc") list.sort((a, b) => a.year - b.year);
    if (sort === "year-desc") list.sort((a, b) => b.year - a.year);
    return list;
  }, [activeCategory, sort, search]);

  return (
    <div className="min-h-screen bg-black pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-screen-xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16 md:mb-20"
        >
          <p className="text-[10px] tracking-[0.4em] uppercase text-zinc-600 font-mono mb-3">
            {t("Current Selection", "Текущий выбор")}
          </p>
          <h1 className="font-display text-6xl md:text-8xl font-light leading-none">
            {t("The Shop.", "Каталог.")}
          </h1>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="border-y border-white/8 py-5 mb-12 flex flex-col md:flex-row gap-6 md:items-center justify-between"
        >
          {/* Categories */}
          <div className="flex gap-6 overflow-x-auto pb-1 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`text-xs tracking-[0.25em] uppercase shrink-0 transition-colors duration-200 ${
                  activeCategory === cat.value ? "text-white" : "text-zinc-600 hover:text-zinc-300"
                }`}
              >
                {t(cat.en, cat.ru)}
                {activeCategory === cat.value && (
                  <motion.div layoutId="activeCategory" className="h-px bg-white mt-1" />
                )}
              </button>
            ))}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder={t("Search...", "Поиск...")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border border-white/10 hover:border-white/25 focus:border-white/40 outline-none px-4 py-2 text-xs text-white placeholder:text-zinc-700 font-mono tracking-wider w-44 transition-colors"
            />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-black border border-white/10 hover:border-white/25 outline-none px-3 py-2 text-xs text-zinc-400 font-mono tracking-wider cursor-pointer"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>{t(o.en, o.ru)}</option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Count */}
        <p className="text-xs text-zinc-700 font-mono tracking-wider mb-10">
          {filtered.length} {t(
            filtered.length !== 1 ? "pieces" : "piece",
            filtered.length !== 1 ? "позиции" : "позиция"
          )}
        </p>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
            {filtered.map((watch, i) => (
              <WatchCard key={watch.id} watch={watch} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <p className="font-display text-3xl text-zinc-700 font-light italic mb-3">
              {t("Nothing here.", "Ничего не найдено.")}
            </p>
            <p className="text-xs text-zinc-700 font-mono tracking-wider">
              {t("Try a different filter.", "Попробуйте другой фильтр.")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <ShopContent />
    </Suspense>
  );
}
