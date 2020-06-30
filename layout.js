import Head from 'next/head'
import Version from '../version-app'
import Loading from '../components/loading'
import Msg from '../components/msg'
import Router from 'next/router'
import { getSession } from '../libs/functions'

const now = new Date();

export default class extends React.Component {

  componentDidMount(){
    if(this.props.protected===true && getSession("userData")===false){
      Router.push('/login')
    }
  }

  render(){
    if(this.props.protected===true && getSession("userData")===false){
      return null
    }else{
      return (
        <div>
          <Head>
            <link rel="icon" href="/favicon.ico" />
            <meta
              name="description"
              content={this.props.description ? this.props.description : "Layout Component"}
            />
          </Head>
          <Loading></Loading>
          <Msg></Msg>
          <div className="layout-base">  
            {this.props.children}
            <div className="layout-item layout-space-ha"></div>
            <div className="layout-item layout-space-hc"></div>
            <div className="layout-item layout-space-ma"></div>
            <div className="layout-item layout-space-mc"></div>
            <div className="layout-item layout-space-fb">
              <div className="text-center">
                {this.props.appName ? this.props.appName : "Layout Component"} © {now.getFullYear()}<br/>Todos os Direitos Reservados <Version/>
              </div>
            </div>
          </div>
        </div>
      )
    }
  }
}