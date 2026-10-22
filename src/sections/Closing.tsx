import { useState } from 'react';
import { Copy01Icon, CopyCheckIcon, Mail01Icon } from '@hugeicons/core-free-icons';
import TearTicket from '@/components/reactbits/TearTicket/TearTicket';
import SwipeToast from '@/components/reactbits/SwipeToast/SwipeToast';
import ClickSpark from '@/components/reactbits/ClickSpark/ClickSpark';
import Icon from '@/components/ui/Icon';
import { Container, SectionTitle } from '@/components/ui/Layout';
import { BrandMark, LineBadge } from '@/components/ui/Line';
import { AFFILIATIONS, BIBTEX, CONTACT, PAPER } from '@/data/paper';
import { useTheme } from '@/theme/ThemeProvider';
import logoLight from '@/assets/brand/infrec.webp';
import logoDark from '@/assets/brand/infrec-dark.webp';

export default function Closing() {
  const { t, theme } = useTheme();
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(BIBTEX);
      setCopied(true);
      setToast(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      /* the text stays selectable below */
    }
  };

  return (
    <>
      <section id="cite" className="relative scroll-mt-20 py-24 sm:py-32">
        <Container wide>
          <div className="grid items-center gap-x-16 gap-y-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
            <div>
              <SectionTitle>Take a ticket</SectionTitle>
              <p className="lede mt-5">
                If REA is useful to your work, please cite the paper: tear off the stub to copy the BibTeX. The runtime, the frozen skill libraries
                and every per-episode record will be released with it.
              </p>
            </div>
            <div className="flex justify-center lg:justify-end">
              <TearTicket
                width={520}
                height={250}
                stubSize={160}
                radius={18}
                holes={11}
                background={theme === 'dark' ? '#151a22' : '#ffffff'}
                color={t.ink}
                borderColor={t.rule2}
                stubBackground={theme === 'dark' ? '#1d2430' : '#f2f3f6'}
                onTear={copy}
                ariaLabel="Tear off the stub to copy the BibTeX"
                stub={
                  <div className="flex h-full flex-col items-center justify-center gap-2 px-3 text-center">
                    <BrandMark size={34} />
                    <p className="text-[15px] font-[780] leading-tight [font-stretch:86%]">Tear to copy</p>
                    <p className="text-[12px] text-ink-3">BibTeX</p>
                  </div>
                }
              >
                <div className="flex h-full flex-col justify-between p-6">
                  <div className="flex items-center gap-1.5">
                    <LineBadge line="s2" size={12} />
                    <LineBadge line="s1" size={12} />
                    <LineBadge line="s0" size={12} />
                    <span className="ml-2 text-[12.5px] font-[650] text-ink-3">Valid on all lines</span>
                  </div>
                  <div>
                    <p className="text-[44px] font-[820] leading-[0.9] [font-stretch:78%]">{PAPER.name}</p>
                    <p className="mt-2 text-[14px] font-[640] leading-snug text-ink-2">{PAPER.subtitle}</p>
                  </div>
                  <div className="flex items-end justify-between text-[12.5px] text-ink-3">
                    <span>Zhou, Ma, Zhang, Chen, Wan, Wang, Zhao, You</span>
                    <span className="tabular">2026</span>
                  </div>
                </div>
              </TearTicket>
            </div>
          </div>

          <div className="relative mt-14 overflow-hidden rounded-[18px] bg-[#0d0f13] text-[#e8eaee] dark:ring-1 dark:ring-white/10">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
              <span className="text-[13px] font-[650] text-white/60">BibTeX</span>
              <ClickSpark sparkColor={[t.s2g, t.s1g, t.s0g]} sparkCount={12} sparkRadius={30} sparkSize={8} className="!h-auto !w-auto">
                <button
                  type="button"
                  onClick={copy}
                  className="inline-flex h-9 items-center gap-2 rounded-full bg-white px-4 text-[14px] font-[700] text-[#0d0f13] transition-transform active:scale-95"
                >
                  <Icon icon={copied ? CopyCheckIcon : Copy01Icon} size={16} />
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </ClickSpark>
            </div>
            <pre className="code overflow-x-auto px-5 py-5 text-[13.5px] leading-[1.7]">{BIBTEX}</pre>
          </div>
        </Container>
      </section>

      <footer className="relative border-t border-rule pb-14 pt-10">
        <Container wide className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <div className="flex items-center gap-3">
              <BrandMark size={28} />
              <span className="text-[22px] font-[800] [font-stretch:84%]">REA</span>
              <span className="text-[14px] text-ink-3">{PAPER.subtitle}</span>
            </div>
            <p className="mt-4 max-w-[80ch] text-[13px] leading-[1.7] text-ink-3">
              {AFFILIATIONS.map((a, i) => (
                <span key={a} className="mr-4 inline-block">
                  <sup className="tabular mr-0.5">{i + 1}</sup>
                  {a}
                </span>
              ))}
            </p>
            <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13.5px] text-ink-2">
              <Icon icon={Mail01Icon} size={15} />
              {CONTACT.map((c) => (
                <a key={c} href={`mailto:${c}`} className="underline decoration-rule-2 underline-offset-4 hover:decoration-ink">
                  {c}
                </a>
              ))}
            </p>
          </div>
          <img src={theme === 'dark' ? logoDark : logoLight} alt="InfRec, Cardinal AI Lab" className="h-10 w-auto" />
        </Container>
      </footer>

      <div className="fixed bottom-6 left-1/2 z-[70] -translate-x-1/2">
        <SwipeToast
          open={toast}
          onClose={() => setToast(false)}
          title="BibTeX copied"
          description="Paste it into your .bib file."
          background={t.ink}
          color={t.paper}
          fuseColor={t.s1g}
          duration={3200}
          width={320}
        />
      </div>
    </>
  );
}
