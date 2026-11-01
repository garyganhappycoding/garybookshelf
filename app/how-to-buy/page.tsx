import Link from "next/link";

export const metadata = {
  title: "How to buy · Gary's Bookshelf",
  description: "Step by step: how to buy the speaking冲刺包 and download your files.",
};
export const revalidate = 3600;

const STEPS: { n: number; en: string; zh: string; text: string; textZh: string; tip?: string; tipZh?: string; img: string; alt: string }[] = [
  {
    n: 1,
    en: "Log in to the website",
    zh: "登录网站",
    text: "Tap Log in at the top right. No account yet? Tap Sign up and make a free one first.",
    textZh: "点右上角的 Log in 登录。还没有账号？先点 Sign up 免费注册。",
    tip: "Opening from Instagram? Tap ⋯ and choose “Open in browser” (Safari or Chrome) first.",
    tipZh: "从 Instagram 打开的话，先点 ⋯ 选择「在浏览器中打开」(Safari / Chrome)。",
    img: "/guide/buy-1.webp",
    alt: "Log in page on a phone",
  },
  {
    n: 2,
    en: "Tap Shop",
    zh: "点「Shop」",
    text: "Tap Shop in the menu. Find speaking冲刺包 and tap it.",
    textZh: "点菜单里的 Shop，找到 speaking冲刺包 并点进去。",
    img: "/guide/buy-2.webp",
    alt: "Shop page on a phone",
  },
  {
    n: 3,
    en: "Choose your product and pay",
    zh: "选择产品并付款",
    text: "Scan the Touch 'n Go QR code and pay the exact price shown on the page.",
    textZh: "用 Touch 'n Go 扫描二维码，按页面上显示的价钱付款。",
    img: "/guide/buy-3.webp",
    alt: "Product page with the Touch 'n Go QR code",
  },
  {
    n: 4,
    en: "Upload your payment",
    zh: "上传付款截图",
    text: "Take a screenshot of your payment receipt, tap Choose image to upload it, then tap Submit for verification.",
    textZh: "截图你的付款成功页面，点 Choose image 上传，再点 Submit for verification。",
    img: "/guide/buy-4.webp",
    alt: "Uploading the payment receipt",
  },
  {
    n: 5,
    en: "Open My orders and wait for verification",
    zh: "到「My orders」等待审核",
    text: "Tap My orders (top right). It shows Pending verification. Gary checks payments by hand, usually within a day.",
    textZh: "点右上角 My orders，会显示 Pending verification。Gary 会手动核对付款，通常一天内完成。",
    img: "/guide/buy-5.webp",
    alt: "My orders page showing Pending verification",
  },
  {
    n: 6,
    en: "Once approved, copy your password",
    zh: "审核通过后，记得复制密码",
    text: "When it says Approved, you will see your PDF password. Copy it and keep it safe. You need it to open every file.",
    textZh: "显示 Approved 后会出现你的 PDF 密码。请复制并保存好，打开每个文件都需要它。",
    img: "/guide/buy-6.webp",
    alt: "Approved order showing the PDF password",
  },
  {
    n: 7,
    en: "Download your files and save them",
    zh: "下载文件并保存",
    text: "Tap Download on each file. Each file can be downloaded only once, so save every file into your own Google Drive or phone straight away.",
    textZh: "点每个文件旁的 Download。每个文件只能下载一次，所以请马上把文件存到你自己的 Google Drive 或手机。",
    tip: "Do it in Safari or Chrome, on the phone or laptop where you will read the files.",
    tipZh: "请在 Safari 或 Chrome 里下载，并用你自己要阅读文件的手机或电脑。",
    img: "/guide/buy-7.webp",
    alt: "List of files with Download buttons",
  },
  {
    n: 8,
    en: "Problem? Request a re-download",
    zh: "有问题？申请重新下载",
    text: "If a file failed to download, or you need it again, tap Request re-download at the bottom of your order and write what happened. Gary reviews it and resets your downloads.",
    textZh: "如果某个文件下载失败，或需要重新下载，请在订单最下面点 Request re-download，写下情况。Gary 会审核并为你重置。",
    img: "/guide/buy-8.webp",
    alt: "The Request re-download box",
  },
];

export default function HowToBuyPage() {
  return (
    <div className="max-w-xl mx-auto px-5 py-12">
      <h1 className="font-hand text-4xl text-clay-700 mb-1">How to buy</h1>
      <p className="text-ink/70 mb-1">8 easy steps for the speaking冲刺包, or any product in the shop.</p>
      <p className="text-ink/70 mb-8">购买 speaking冲刺包（或商店任何产品）的 8 个简单步骤。</p>

      <div className="space-y-10">
        {STEPS.map((s) => (
          <section key={s.n} className="card !p-5">
            <div className="flex items-start gap-3 mb-3">
              <span className="shrink-0 w-9 h-9 rounded-full bg-clay-600 text-white font-semibold flex items-center justify-center">{s.n}</span>
              <div>
                <h2 className="text-lg font-medium leading-snug">{s.en}</h2>
                <p className="text-ink/60 text-sm">{s.zh}</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed">{s.text}</p>
            <p className="text-sm leading-relaxed text-ink/70 mb-3">{s.textZh}</p>
            {s.tip && (
              <p className="text-sm bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-3">
                💡 {s.tip}
                <span className="block text-ink/70">{s.tipZh}</span>
              </p>
            )}
            {/* a phone-sized screenshot of the real site */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={s.img}
              alt={s.alt}
              loading="lazy"
              width={390}
              className="w-full max-w-[280px] mx-auto rounded-[28px] border-[6px] border-ink/80 shadow-md bg-white"
            />
          </section>
        ))}
      </div>

      <div className="card mt-10 text-center">
        <p className="font-medium mb-3">Ready? · 准备好了吗？</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/shop" className="btn-primary">Go to Shop</Link>
          <Link prefetch={false} href="/dashboard" className="btn-secondary">My orders</Link>
        </div>
        <p className="text-xs text-ink/50 mt-4">Stuck? Send me a message on Instagram @gary_bookshelf · 遇到问题可以 Instagram 私信 @gary_bookshelf</p>
      </div>
    </div>
  );
}
