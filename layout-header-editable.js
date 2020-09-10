import Head from 'next/head'
import Loading from './loading'
import Msg, { openMsg } from './msg'
import Router from 'next/router'
import { getSession,setCols,unSetSession,keyboardEvent } from '../libs/functions'
import Top from './top-login-version-home-logout'

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
    getSession("userData",undefined,true,(userData) => {
      if(this.props.protected===true && userData===false){
        this.setState({showChildren:false})
        openMsg({text:'Área Restrita!<br/>Você será redirecionado para página de login!',callbackYes:this.logout,callbackNo:this.logout,type:-1})
      }else if(this.props.protected===true && userData){
        if(userData.branchSelected>=0){
          this.setState({showChildren:true})
        }else{
          this.setState({showChildren:false})
          openMsg({text:'Olá, escolha uma filial!',type:-1})
        }
      }else if(this.props.protected===false || typeof this.props.protected === 'undefined'){
        this.setState({showChildren:true})
      }
      keyboardEvent(this.onKey)
    })
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
    unSetSession("userData",undefined,true,(userData) => {
      unSetSession("userData")
      Router.push('/login')
    })
  }

  onKey = (e) => {
    if(e=="F2"){
      Router.push('/')
    }else if(e=="F4"){
      if(this.props.callbackCancel){
        this.props.callbackCancel()
      }
    }
  }

  render(){
    return (
      <>
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
          <div className="layout-header-editable-base">
            {this.props.children}
          </div>
        ):(
          <div className="layout-header-editable-base">
            <Top callbackSelectBranch={() => this.setState({showChildren:true})} className="layout-header-editable-item layout-header-editable-space-h" />
          </div>
        )}
      </>
    )
  }
}