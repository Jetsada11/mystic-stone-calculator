import { useState, useCallback } from "react";
import mysticStoneImg from "@/assets/mystic-stone.png";
import darkenedStoneImg from "@/assets/darkened-stone.png";
import dsIcon from "@/assets/ds-icon.png";
import clanCoinImg from "@/assets/clan-coin.png";
import goldImg from "@/assets/gold-icon.png";

type StoneType = "mystic" | "darkened";
type InputMode = "ds" | "stone";
type Lang = "en" | "th";

const t = {
  en: {
    title: "Stone Purchase Calculator",
    mystic: "Mystic Stone",
    darkened: "Darkened Stone",
    inputDS: "Enter DS",
    inputStone: "Enter Stone Amount",
    dsPlaceholder: "DS amount you have",
    stonePlaceholder: (name: string) => `${name} amount you want`,
    tax30: "Deduct 30% Tax",
    calculate: "Calculate",
    results: "Results",
    stones: "stones",
    dsNeeded: "Total DS needed",
    taxDeduct: "Deduct 30% Tax",
    noTax: "No tax deduction",
    goldTax: "Gold for tax payment",
    clanCoins: "Clan coins needed",
  },
  th: {
    title: "คำนวณการซื้อหิน",
    mystic: "หินลึกลับ",
    darkened: "หินมืด",
    inputDS: "กรอก DS",
    inputStone: "กรอกจำนวนหิน",
    dsPlaceholder: "จำนวน DS ที่มี",
    stonePlaceholder: (name: string) => `จำนวน ${name} ที่ต้องการ`,
    tax30: "หักภาษี 30%",
    calculate: "คำนวณ",
    results: "ผลลัพธ์",
    stones: "ก้อน",
    dsNeeded: "DS ที่ต้องใช้ทั้งหมด",
    taxDeduct: "หักภาษี 30%",
    noTax: "ไม่มีการหักภาษี",
    goldTax: "ทองจ่ายค่าภาษี",
    clanCoins: "เหรียญแคลนที่ต้องใช้",
  },
};

const STONE_DATA = {
  mystic: { price: 2000, clanCoins: 160, img: mysticStoneImg },
  darkened: { price: 4500, clanCoins: 375, img: darkenedStoneImg },
};

function formatNumber(num: number) {
  return num.toLocaleString();
}

export default function StoneCalculator() {
  const [lang, setLang] = useState<Lang>("en");
  const [stone, setStone] = useState<StoneType>("mystic");
  const [inputMode, setInputMode] = useState<InputMode>("ds");
  const [dsValue, setDsValue] = useState("");
  const [stoneCount, setStoneCount] = useState("");
  const [taxEnabled, setTaxEnabled] = useState(false);
  const [result, setResult] = useState<null | {
    stones: number;
    taxAmount: number;
    goldCost: number;
    clanCoins: number;
    dsNeeded: number;
  }>(null);

  const l = t[lang];
  const data = STONE_DATA[stone];
  const stoneName = lang === "en" ? (stone === "mystic" ? "Mystic Stone" : "Darkened Stone") : (stone === "mystic" ? "หินลึกลับ" : "หินมืด");

  const parseNum = (v: string) => parseInt(v.replace(/,/g, "")) || 0;

  const handleDsInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    setDsValue(raw ? parseInt(raw).toLocaleString() : "");
  };

  const handleStoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    setStoneCount(raw ? parseInt(raw).toLocaleString() : "");
  };

  const calculate = useCallback(() => {
    if (inputMode === "ds") {
      const totalDS = parseNum(dsValue);
      if (totalDS <= 0) return;
      const taxRate = taxEnabled ? 0.3 : 0;
      const taxAmount = Math.floor(totalDS * taxRate);
      const remaining = totalDS - taxAmount;
      const stones = Math.floor(remaining / data.price);
      const goldCost = taxEnabled ? Math.ceil(taxAmount / 100000) : 0;
      const clanCoins = stones * data.clanCoins;
      setResult({ stones, taxAmount, goldCost, clanCoins, dsNeeded: totalDS });
    } else {
      const wantedStones = parseNum(stoneCount);
      if (wantedStones <= 0) return;
      const dsForStones = wantedStones * data.price;
      const totalDS = taxEnabled ? Math.ceil(dsForStones / 0.7) : dsForStones;
      const taxAmount = taxEnabled ? Math.floor(totalDS * 0.3) : 0;
      const goldCost = taxEnabled ? Math.ceil(taxAmount / 100000) : 0;
      const clanCoins = wantedStones * data.clanCoins;
      setResult({ stones: wantedStones, taxAmount, goldCost, clanCoins, dsNeeded: totalDS });
    }
  }, [inputMode, dsValue, stoneCount, taxEnabled, data]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card rounded-2xl p-6 sm:p-8 w-full max-w-md space-y-6 glow-gold relative">
        {/* Language Toggle */}
        <button
          onClick={() => setLang(lang === "en" ? "th" : "en")}
          className="absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all duration-200 hover:scale-105"
          style={{ background: "var(--gradient-gold)", color: "hsl(var(--primary-foreground))" }}
        >
          {lang === "en" ? "TH" : "EN"}
        </button>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-center text-gradient-gold pr-12">
          {l.title}
        </h1>

        {/* Stone Selection */}
        <div className="grid grid-cols-2 gap-3">
          {(["mystic", "darkened"] as const).map((type) => {
            const s = STONE_DATA[type];
            const selected = stone === type;
            const name = lang === "en" ? t.en[type] : t.th[type];
            return (
              <button
                key={type}
                onClick={() => { setStone(type); setResult(null); }}
                className={`relative rounded-xl p-4 text-center transition-all duration-300 cursor-pointer border-2 ${
                  selected
                    ? "border-primary bg-secondary/60 shadow-lg shadow-primary/20 scale-[1.02]"
                    : "border-border bg-muted/30 hover:border-muted-foreground/40 hover:bg-muted/50"
                }`}
              >
                <img src={s.img} alt={name} className="w-16 h-16 mx-auto mb-2 drop-shadow-lg" width={64} height={64} />
                <p className={`font-semibold text-sm ${selected ? "text-primary" : "text-foreground"}`}>{name}</p>
                <p className="text-xs text-muted-foreground mt-1">{formatNumber(s.price)} DS</p>
              </button>
            );
          })}
        </div>

        {/* Input Mode Toggle */}
        <div className="flex rounded-lg overflow-hidden border border-border">
          {(["ds", "stone"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => { setInputMode(mode); setResult(null); }}
              className={`flex-1 py-2.5 text-sm font-semibold transition-all duration-200 cursor-pointer ${
                inputMode === mode
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
              }`}
            >
              {mode === "ds" ? l.inputDS : l.inputStone}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="space-y-3">
          {inputMode === "ds" ? (
            <div className="flex items-center gap-3 bg-muted/30 rounded-xl px-4 py-3 border border-border focus-within:border-primary transition-colors">
              <img src={dsIcon} alt="DS" className="w-8 h-8" width={32} height={32} />
              <input
                type="text"
                value={dsValue}
                onChange={handleDsInput}
                placeholder={l.dsPlaceholder}
                className="flex-1 bg-transparent outline-none text-foreground text-lg font-medium placeholder:text-muted-foreground"
              />
            </div>
          ) : (
            <div className="flex items-center gap-3 bg-muted/30 rounded-xl px-4 py-3 border border-border focus-within:border-primary transition-colors">
              <img src={data.img} alt={stoneName} className="w-8 h-8" width={32} height={32} />
              <input
                type="text"
                value={stoneCount}
                onChange={handleStoneInput}
                placeholder={l.stonePlaceholder(stoneName)}
                className="flex-1 bg-transparent outline-none text-foreground text-lg font-medium placeholder:text-muted-foreground"
              />
            </div>
          )}

          {/* Tax Toggle */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div
              onClick={() => setTaxEnabled(!taxEnabled)}
              className={`w-11 h-6 rounded-full relative transition-colors duration-200 ${
                taxEnabled ? "bg-primary" : "bg-muted"
              }`}
            >
              <div
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-primary-foreground transition-transform duration-200 ${
                  taxEnabled ? "translate-x-5" : ""
                }`}
              />
            </div>
            <span className="text-sm text-secondary-foreground">{l.tax30}</span>
          </label>
        </div>

        {/* Calculate Button */}
        <button
          onClick={calculate}
          className="w-full py-3.5 rounded-xl font-bold text-lg transition-all duration-300 cursor-pointer"
          style={{ background: "var(--gradient-gold)", color: "hsl(var(--primary-foreground))" }}
        >
          {l.calculate}
        </button>

        {/* Results */}
        {result && (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-lg font-bold text-gradient-gold text-center">{l.results}</h3>

            <ResultRow icon={data.img} label={stoneName} value={`${formatNumber(result.stones)} ${l.stones}`} />

            {inputMode === "stone" && (
              <ResultRow icon={dsIcon} label={l.dsNeeded} value={`${formatNumber(result.dsNeeded)} DS`} />
            )}

            <ResultRow
              icon={dsIcon}
              label={taxEnabled ? l.taxDeduct : l.noTax}
              value={taxEnabled ? `${formatNumber(result.taxAmount)} DS` : "-"}
            />

            <ResultRow
              icon={goldImg}
              label={l.goldTax}
              value={taxEnabled && result.goldCost > 0 ? `${formatNumber(result.goldCost)} Gold` : "-"}
            />

            <ResultRow
              icon={clanCoinImg}
              label={l.clanCoins}
              value={`${formatNumber(result.clanCoins)} Coins`}
              highlight
            />
          </div>
        )}
      </div>
    </div>
  );
}

function ResultRow({ icon, label, value, highlight }: { icon: string; label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`flex items-center gap-3 rounded-xl px-4 py-3 ${highlight ? "bg-primary/10 border border-primary/30" : "bg-muted/30 border border-border"}`}>
      <img src={icon} alt="" className="w-7 h-7" width={28} height={28} loading="lazy" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`font-bold text-sm ${highlight ? "text-primary" : "text-foreground"}`}>{value}</p>
      </div>
    </div>
  );
}
