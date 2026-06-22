import { Users, Home, User, UserRound } from "lucide-react";

export default function Statistik({ data }) {
  const items = [
    {
      label: "Kepala Keluarga",
      value: data?.total_kk ?? "—",
      icon: Home,
      testId: "stat-kk",
    },
    {
      label: "Total Jiwa",
      value: data?.total_jiwa ?? "—",
      icon: Users,
      testId: "stat-jiwa",
    },
    {
      label: "Laki - laki",
      value: data?.laki_laki ?? "—",
      icon: User,
      testId: "stat-laki",
    },
    {
      label: "Perempuan",
      value: data?.perempuan ?? "—",
      icon: UserRound,
      testId: "stat-perempuan",
    },
  ];

  return (
    <section
      id="statistik"
      data-testid="statistik-section"
      className="py-24 lg:py-32 bg-[#F4F1EB]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 items-end mb-16">
          <div className="lg:col-span-7">
            <div className="overline-eyebrow mb-4">Statistik Warga</div>
            <h2 className="font-serif-display text-4xl sm:text-5xl text-[#1A1C18] leading-tight">
              Data Warga
              <br />
              <span className="italic text-[#2D4A3E]">RT 037 RW 002</span>
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-[#4A4D48] text-lg">
              Komposisi warga yang harmonis menjadi kekuatan komunitas kami.
              Data diperbarui secara berkala oleh sekretariat RT.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {items.map((it) => {
            const Icon = it.icon;
            return (
              <div
                key={it.testId}
                data-testid={it.testId}
                className="heritage-card p-6 lg:p-8 bg-white"
              >
                <Icon size={28} className="text-[#C05638]" strokeWidth={1.5} />
                <div className="mt-6 font-serif-display text-5xl lg:text-6xl text-[#1A1C18]">
                  {it.value}
                </div>
                <div className="mt-2 text-sm uppercase tracking-[0.15em] text-[#757873]">
                  {it.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
