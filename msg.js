var observerData = {}

class Observable {
  constructor() {
    this.observers = [];
  }

  subscribe(f) {
    this.observers.push(f);
  }

  unsubscribe(f) {
    this.observers = this.observers.filter(subscriber => subscriber !== f);
  }

  notify() {
    this.observers.forEach(observer => observer(observerData));
  }
}

const headingsObserver = new Observable();

export default class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      text:'Mensagem?',
      textYes:'Ok',
      textNo:'Cancelar',
      callbackYes:closeMsg,
      callbackNo:closeMsg
    };
  }

  componentDidMount(){
    headingsObserver.subscribe(this.update)
  }

  update = () => {
    this.setState({
      text:observerData.text,
      textYes:observerData.textYes,
      textNo:observerData.textNo,
      callbackYes:observerData.callbackYes,
      callbackNo:observerData.callbackNo
    })
  }

  onClick = (e) => {
    if(e.target.name=='yes'){
      this.state.callbackYes()
    }else if(e.target.name=='no'){
      this.state.callbackNo()
    }
  }

  render(){
    return (
      <div id="baseMsg" name="baseMsg" className="col-12">
        <div id="msg" name="msg" className="col-12">
          <div id="textMsg" name="textMsg" className="col-12">
            Mensagem?
          </div>
          <div id="buttonsMsg" name="buttonsMsg" className="col-12">
            <div className="col-12">
              <button id="yes" name="yes" type="button" className="btn btn-success btn-lg m-2" onClick={this.onClick}>{this.state.textYes}</button>
              <button id="no" name="no" type="button" className="btn btn-warning btn-lg m-2" onClick={this.onClick}>{this.state.textNo}</button>
            </div>
          </div>
          <div id="textMsgB" name="textMsgB" className="col-12">
          </div>
        </div>
      </div>
    )
  }
}

export function openMsg(data){
  const stdObserverData = {
    text:'Mensagem?',
    textYes:'Ok',
    textNo:'Cancelar',
    callbackYes:closeMsg,
    callbackNo:closeMsg
  }
  observerData = stdObserverData
  if(typeof data !== 'undefined'){
    if(typeof data.text !== 'undefined'){
      if(data.text.length>0){
        document.getElementById("textMsg").innerHTML = data.text
      }
    }
    if(typeof data.textYes !== 'undefined'){
      if(data.textYes.length>0){
        observerData.textYes = data.textYes
      }
    }
    if(typeof data.textNo !== 'undefined'){
      if(data.textNo.length>0){
        observerData.textNo = data.textNo
      }
    }
    if(typeof data.type !== 'undefined'){
      if(typeof data.blackout === 'undefined'){
        var blackout = "0.95"
      }else{
        var blackout = "1"
      }
      if(data.type==1){
        document.getElementById("baseMsg").style.backgroundColor = "rgba(20,100,20," + blackout + ")";
      }else if(data.type==-1){
        document.getElementById("baseMsg").style.backgroundColor = "rgba(120,10,10," + blackout + ")";
      }else{
        document.getElementById("baseMsg").style.backgroundColor = "rgba(0,40,70," + blackout + ")";
      }
    }
    if(typeof data.callbackYes !== 'undefined'){
      observerData.callbackYes = data.callbackYes
    }
    if(typeof data.callbackNo !== 'undefined'){
      observerData.callbackNo = data.callbackNo
    }
  }

  document.getElementById("baseMsg").style.display = "flex"
  headingsObserver.notify()
}

export function closeMsg(){
  document.getElementById("baseMsg").style.display = "none"
}