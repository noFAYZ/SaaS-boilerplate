import { Link } from "@heroui/link";
import { Snippet } from "@heroui/snippet";
import { Code } from "@heroui/code";
import { button as buttonStyles } from "@heroui/theme";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";

import { siteConfig } from "@/config/site";
import { title, subtitle, card } from "@/components/primitives";
import { GithubIcon, LogoMappr } from "@/components/icons";

export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center gap-8 py-8 md:py-10">
          <div className="absolute inset-0 -z-10">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-orange-500 opacity-20 blur-[100px]" />
      <div className="absolute right-0 top-1/4 -z-10 h-[310px] w-[310px] rounded-full bg-pink-500 opacity-20 blur-[100px]" />
      <div className="absolute bottom-1/4 left-0 -z-10 h-[310px] w-[310px] rounded-full bg-orange-500 opacity-20 blur-[100px]" />
    </div>
      <div className="inline-block max-w-xl text-center justify-center">
        <div className="mb-2">
          <span className="inline-block px-3 py-1 mb-4 text-xs font-medium rounded-full bg-primary-500/10 text-primary-500">
            Welcome to ACME Finance 
          </span>
        </div>
        <span className={title({ color: "foreground", size: 'lg' })}>Modern&nbsp;</span>
        <span className={title({ color: "primary", size: 'lg' })}>Finance&nbsp;</span>
        <br />
        <span className={title({ color: "foreground", size: 'lg' })}>
          for the digital age.
        </span>
        <div className={subtitle({ class: "mt-4 text-md", })}>
          Beautiful, fast, and reliable financial tracking built for modern businesses.
        </div>
      </div>

      <div className="flex gap-3">
        <Link
          isExternal
          className={buttonStyles({
            color: "default",
            radius: "full",
            variant: "shadow",
            size: "md",
          })}
          href={siteConfig.links.docs}
        >
          Get Started
        </Link>
        <Link
          isExternal
          className={buttonStyles({ 
            variant: "bordered", 
            radius: "full",
            size: "md",
          })}
          href={siteConfig.links.github}
        >
          <GithubIcon size={20} />
          View on GitHub
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl mt-10">
        {/* Feature Card 1 */}
        <Card className={card({ clickable: true })}>
          <CardHeader className="flex gap-3">
            <div className="flex flex-col">
              <p className="text-md font-semibold">Portfolio Management</p>
              <p className="text-small text-default-500">Track all your investments</p>
            </div>
          </CardHeader>
          <Divider/>
          <CardBody>
            <p className="text-md font-normal">Monitor portfolio performance with real-time market data and custom alerts.</p>
          </CardBody>
          <CardFooter>
            <Link 
              href="/portfolios" 
              color="primary" 
              className="text-sm"
              showAnchorIcon
            >
              Explore portfolios
            </Link>
          </CardFooter>
        </Card>

        {/* Feature Card 2 */}
        <Card className={card({ clickable: true })}>
          <CardHeader className="flex gap-3">
            <div className="flex flex-col">
              <p className="text-md font-semibold">Financial Analytics</p>
              <p className="text-small text-default-500">Insights that matter</p>
            </div>
          </CardHeader>
          <Divider/>
          <CardBody>
            <p>Advanced analytics with customizable visualizations to understand your finances better.</p>
          </CardBody>
          <CardFooter>
            <Link 
              href="/analytics" 
              color="primary" 
              className="text-sm"
              showAnchorIcon
            >
              View analytics
            </Link>
          </CardFooter>
        </Card>

        {/* Feature Card 3 */}
        <Card className={card({ clickable: true })}>
          <CardHeader className="flex gap-3">
            <div className="flex flex-col">
              <p className="text-md font-semibold">Account Management</p>
              <p className="text-small text-default-500">Simplified banking</p>
            </div>
          </CardHeader>
          <Divider/>
          <CardBody>
            <p>Connect your accounts seamlessly and manage all your finances in one place.</p>
          </CardBody>
          <CardFooter>
            <Link 
              href="/accounts" 
              color="primary" 
              className="text-sm"
              showAnchorIcon
            >
              Manage accounts
            </Link>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-8">
        <Snippet hideCopyButton hideSymbol variant="flat" className="bg-primary-500/5 border-primary-500/20">
          <span>
            Get started by editing <Code color="primary">app/page.tsx</Code>
          </span>
        </Snippet>
      </div>
    </section>
  );
}