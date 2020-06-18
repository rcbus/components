import Head from 'next/head'
import Version from './version'

export default function Layout({children}) {

  const now = new Date();

  return (
    <div>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="description"
          content="Interface do Profiable para o Representante"
        />
      </Head>
      <body>
        <div className="base">  
          {children}
          <div className="item space-ha"></div>
          <div className="item space-hc"></div>
          <div className="item space-ma"></div>
          <div className="item space-mc"></div>
          <div className="item space-fb"><i>Profiable © {now.getFullYear()} - Todos os Direitos Reservados<br/><Version></Version></i></div>
        </div>
      </body>
    </div>
  )
}