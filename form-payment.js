import { setCols,verifyVariable } from '../libs/functions'

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        
        }
    }

    verifyType = (type) => {
        if(type == this.props.data.type){
            return 'btn-success'
        }else{
            return 'btn-secondary'
        }
    }
    
    render(){
        return (
            <div className="form-row mt-3">
                <div className={setCols(12,4,4,2,2)}>
                    <input type="number" className="form-control form-control-lg text-right mt-2" value={this.props.data.value} onChange={(e) => this.props.callbackSetForm(this.props.id,e.target.value)} step="0.01" readOnly={this.props.data.type=='' ? (this.props.data.value==0 ? true : false) : true} />
                </div>
                <div className={setCols(12,4,4,2,2)}>
                    <button type="button" className={"btn " + this.verifyType('D') + " btn-lg btn-block mt-2"} onClick={() => (this.props.data.type=='' && this.props.callbackSetFormPaymentMethod(this.props.id,'D'))}>Dinheiro (D)</button>
                </div>
                <div className={setCols(12,4,4,2,2)}>
                    <button type="button" className={"btn " + this.verifyType('C') + " btn-lg btn-block mt-2"} onClick={() => (this.props.data.type=='' && this.props.callbackSetFormPaymentMethod(this.props.id,'C'))}>Cartão (C)</button>
                </div>
                <div className={setCols(12,4,4,2,2)}>
                    <button type="button" className={"btn " + this.verifyType('A') + " btn-lg btn-block mt-2"} onClick={() => (this.props.data.type=='' && this.props.callbackSetFormPaymentMethod(this.props.id,'A'))}>App (A)</button>
                </div>
                <div className={setCols(12,4,4,2,2)}>
                    <button type="button" className={"btn " + this.verifyType('H') + " btn-lg btn-block mt-2"} onClick={() => (this.props.data.type=='' && this.props.callbackSetFormPaymentMethod(this.props.id,'H'))}>Cheque (H)</button>
                </div>
                {(this.props.id>0 && this.props.data.type=='') && (
                    <div className={setCols(12,4,4,2,2)}>
                        <button type="button" className={"btn btn-danger btn-lg btn-block mt-2"} onClick={() => (this.props.data.type=='' && this.props.callbackDesactiveFormPayment(this.props.id))}>Excluir</button>
                    </div>
                )}
            </div>
        )
    }
}