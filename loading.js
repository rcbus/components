var observerData = {
  text:[
    'Carregando...',
    'Carregando... Por Favor, Aguarde!',
    'Desculpe-nos, Está Demorando Mais do que o Normal!<br/>Se Preferir Aperte F5 para Recarregar a Página.'
  ],
  count:[0,5,10],
  frequency:1000,
  first:true
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
const headingsObserverCount = new Observable();

setInterval(
  function(){
    headingsObserverCount.notify()
  }
,observerData.frequency)

export default class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      text:observerData.text[0]
    };
  }

  componentDidMount(){
    headingsObserver.subscribe(this.update)
    headingsObserverCount.subscribe(this.updateFrequency)
  }

  updateFrequency = () => {
    if(observerData.count[0]>0){
      if(observerData.count[0]>observerData.count[2]){
        /*this.setState({ text:observerData.text[2] })*/
        document.getElementById("loading").innerHTML = observerData.text[2]
      }else if(observerData.count[0]>observerData.count[1]){
        /*this.setState({ text:observerData.text[1] })*/
        document.getElementById("loading").innerHTML = observerData.text[1]
      }else{
        /*this.setState({ text:observerData.text[0] })*/
        document.getElementById("loading").innerHTML = observerData.text[0]
      }
      if(observerData.count[0]<=observerData.count[2]){
        observerData.count[0] = observerData.count[0] + 1;
      }
    }
  }

  update = () => {
    this.setState({
      text:observerData.text[0]
    })
  }

  render(){
    return (
      <div>
        <div id="loading" name="loading" className="loading pisca">
          <form>
            <div id="textLoading" name="textLoading" className="textLoading">
              <div className="col-12">
                Carregando...
              </div>
            </div>
          </form>
        </div>
      </div>
    )
  }
}

export function openLoading(data){
  if(typeof data !== 'undefined'){
    if(typeof data.text !== 'undefined'){
      if(data.text.length>0){
        Object.keys(data.text).map(key => (
          observerData.text[key] = data.text[key]
        ))
      }
    }
    if(typeof data.count !== 'undefined'){
      if(data.count.length>0){
        Object.keys(data.count).map(key => (
          observerData.count[key] = data.count[key]
        ))
      }
    }
  }

  document.getElementById("loading").style.display = "flex"
  headingsObserver.notify()
}

export function closeLoading(){
  document.getElementById("loading").style.display = "none"
}
