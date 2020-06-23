var observerData = {
  text:'Mensagem?'
}
  
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
      text:observerData.text
    };
  }

  componentDidMount(){
    headingsObserver.subscribe(this.update)
  }

  update = () => {
    this.setState({
      text:observerData.text
    })
  }

  onClick = (e) => {
    if(e.target.name=='yes'){
      closeMsg()
    }else if(e.target.name=='no'){
      closeMsg()
    }
  }

  render(){
    return (
      <div id="baseMsg" name="baseMsg" className="col-12">
        <div id="msg" name="msg" className="col-12">
          <div id="textMsg" name="textMsg" className="col-12">
            {this.state.text}
          </div>
          <div id="buttonsMsg" name="buttonsMsg" className="col-12">
            <div className="col-12">
              <button id="yes" name="yes" type="button" className="btn btn-success btn-lg m-2" onClick={this.onClick}>Ok</button>
              <button id="no" name="no" type="button" className="btn btn-warning btn-lg m-2" onClick={this.onClick}>Cancelar</button>
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
  if(typeof data !== 'undefined'){
    if(typeof data.text !== 'undefined'){
      if(data.text.length>0){
        observerData.text = data.text
      }
    }
    if(typeof data.type !== 'undefined'){
      if(data.type==1){
        document.getElementById("baseMsg").style.backgroundColor = "rgba(20,100,20,0.95)";
      }else if(data.type==-1){
        document.getElementById("baseMsg").style.backgroundColor = "rgba(120,10,10,0.95)";
      }else{
        document.getElementById("baseMsg").style.backgroundColor = "rgba(0,40,70,0.95)";
      }
    }
  }

  document.getElementById("baseMsg").style.display = "flex"
  headingsObserver.notify()
}

export function closeMsg(){
  document.getElementById("baseMsg").style.display = "none"
}