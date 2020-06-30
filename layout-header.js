import Head from 'next/head'
import Version from '../version-app'
import Loading from './loading'
import Msg, { openMsg } from './msg'
import Router from 'next/router'
import { getSession,setCols,unSetSession } from '../libs/functions'

const now = new Date();

export default class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showChildren:false,
      showVersion:false
    }
  }

  componentDidMount(){
    if(this.props.protected===true && getSession("userData")===false){
      this.setState({showChildren:false})
      openMsg({text:'Área Restrita!<br/>Você será redirecionado para página de login!',callbackYes:this.logout,callbackNo:this.logout,type:-1})
    }else if(this.props.protected===true && getSession("userData")){
      this.setState({showChildren:true})
    }else if(this.props.protected===false || typeof this.props.protected === 'undefined'){
      this.setState({showChildren:true})
    }
  }

  onClick = (e) => {
    if(e.target.name=="logout"){
      openMsg({text:'Deseja realmente sair do sistema?',type:0,textYes:'Sim',textNo:'Não',callbackYes:this.logout})
    }
  }
  
  onClickHeader = (e) => {
    this.setState({showVersion:!this.state.showVersion})
  }

  logout = (e) => {
    unSetSession("userData")
    Router.push('/login')
  }

  render(){
    return (
      <div>
        <Head>
          <link rel="icon" href="/favicon.ico" />
          <meta
            name="description"
            content={this.props.description ? this.props.description : "Layout Component"}
          />
          <title>{this.props.title ? this.props.title : "Layout Login Component"}</title>
        </Head>
        <Loading></Loading>
        <Msg></Msg>
        {this.state.showChildren===true ? (
          <div className="layout-header-base">  
            <div className="layout-header-item layout-header-space-h">
              <div name="header" className={setCols(6,6,7,8,9)} onClick={this.onClickHeader}>
                {this.state.showVersion===false ? (
                  <h5><b>{this.props.title} (Cleiton @ Pratic)</b></h5>
                ):(
                  <h5><b><Version align="left"/></b></h5>
                )}
              </div>
              <div className={setCols(6,6,5,4,3) + " text-right"}>
                <button type="button" name="logout" className="btn btn-danger" onClick={this.onClick}>Sair</button>
              </div>
            </div>
            {this.props.children}
          </div>
        ):null}
      </div>
    )
  }
}