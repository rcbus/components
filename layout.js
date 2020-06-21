import Head from 'next/head'
import Version from '../version-app'

export default function Layout({children,description,appName}) {

  const now = new Date();

  return (
    <div>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="description"
          content={description ? description : "Layout Component"}
        />
      </Head>
      <body>
        <div className="base">  
          {children}
          <div className="item space-ha"></div>
          <div className="item space-hc"></div>
          <div className="item space-ma"></div>
          <div className="item space-mc"></div>
          <div className="item space-fb"><i>{appName ? appName : "Layout Component"} © {now.getFullYear()} - Todos os Direitos Reservados<br/><Version></Version></i></div>
        </div>
      </body>
    </div>
  )
}