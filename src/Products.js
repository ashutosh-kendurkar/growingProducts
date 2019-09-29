/* created using react 16.10.1 (CRA) */
import React from "react";
import axios from "axios";

class App extends React.Component {
    constructor() {
        super();
        this.state = {
            salesData: {},
            error: null,
            productList: ['Loading...'],
            productListCreated: false,
            year1:2018,
            year2:2019
        };
    }
    componentDidMount() {
        this.getSalesData(this.state.year1,this.state.year2);
    }

    /* call growing products with year values as first parameters
       third parameter is a anonymous callback function that sets the final product list
    */
    componentDidUpdate() {

        this.growing_products(this.state.year1,this.state.year2, productArray => {
            const listProducts = productArray.map((p, index) => { return <li key={index}>{p}</li> })
            if (!this.state.productListCreated)
                this.setState({ productList: listProducts, productListCreated: true });
        });
    }

    /* fetch data for 2 years */
    getSalesData(year1, year2) {
        this.getData(year1);

        this.getData(year2);

    }

   

    /* 
       it validates the data for product mismatch,
       then reduces the data to get the list of growing products
    */
    growing_products(year1, year2, handler) {

        let latestYear = year1 > year2 ? year1 : year2;
        let earlierYear = year1 > year2 ? year2 : year1;
        let salesData = this.state.salesData;
        let finalData = [];

        if (salesData.hasOwnProperty(year1)
            && salesData.hasOwnProperty(year2)) {

            if (!this.validateData(year1, year2)) {
                this.setState({ error: 'Product Mismatch' });
                return;
            }

            Object.keys(salesData[latestYear]).map((key) => {
                finalData.push({ 'product': key, [year1]: this.getValue(salesData[year1], key), [year2]: this.getValue(salesData[year2], key) });
            })

            let finalProducts = finalData.reduce((a, o) => o[latestYear] > o[earlierYear] ? [...a, o.product] : a, []);

            if (!finalProducts || finalProducts.length < 1)
                finalProducts.push('There are no growing products');

            handler(finalProducts);
        }

    }

    validateData(year1, year2) {
        return this.compareKeys(this.state.salesData[year1], this.state.salesData[year2]);
    }

    compareKeys(a, b) {
        var aKeys = Object.keys(a).sort();
        var bKeys = Object.keys(b).sort();
        return JSON.stringify(aKeys) === JSON.stringify(bKeys);
    }

    getValue(object, property) {
        if (object.hasOwnProperty(property))
            return object[property];

        return 0;
    }

    async getData(param) {
        await axios
            .get(`https://assessments.reliscore.com/api/sales/${param}/`)
            .then(res => {
                if (res.data.status === 'success')
                    this.setState(prevState => ({ salesData: { ...prevState.salesData, [param]: res.data.data } }))
                else
                    this.setState({ error: 'Server Error' })
            })
            .catch(error => {
                this.setState({ error: 'Server Error' })
            });
    }
    render() {
        return <div><div>Growing Products:</div>{this.state.error ? this.state.error : (<ul>{this.state.productList}</ul>)}</div>;
    }
}

export default App;