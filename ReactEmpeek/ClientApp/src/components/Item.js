import React, { Component } from 'react';
import './Item.css';

export class Item extends Component {
    static displayName = Item.name;

    constructor(props) {
        super(props);
        this.state = {
            items: [], name: '', type: '', pageInfo: null, isEditing: false, isEditId: undefined, isChanged: false, pages: [], deleted : false
        };
        this.GetItems = this.GetItems.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.GetItems(1);
    }

	componentDidMount() {

	}

	GetItems = (pageNumber) => {
        fetch('api/Item/GetItems?page='+pageNumber)
            .then(response => response.json())
			.then(data => {
				var pagination = this.getPagination(data.pageInfo);
				this.setState({ items: data.items, loading: false, pageInfo: data.pageInfo, pages: pagination  });
            });
    }

    handleSubmit(event) {
        var item = { name: this.state.name, type: this.state.type };
        fetch('api/Item/AddPoint', {
            method: 'POST',
            body: JSON.stringify(item),
            headers: {
                'Content-Type': 'application/json'
            }
		}).then(() => fetch('api/Item/GetPageInfo')
			.then(response => response.json())
			.then(data => {
				console.log(data);
				var pagination = this.getPagination(data);
				this.GetItems(data.totalPages);
			}));

        event.preventDefault();
		this.setState({ name: '', type: '' });
    }

	handleDelete = (id) => {
		let tmppageinfo = this.state.pageInfo.pageNumber;
		fetch('api/Item/DeleteItem', {
			method: 'DELETE',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ id: id })
		}).then(function (responce) {
		});
    }

    handleEdit = (id) => {
        this.setState({ isEditing: !this.state.isEditing, isEditId: id })
        if (this.state.isEditing === true && this.state.isChanged === true) {
            fetch('api/Item/UpdateItem', {
                method: 'PUT',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(this.state.items.find(item => item.id === id))
            })
            this.setState({ isChanged: false });
        }
    }

    changeElements = (id, event) => {
        let itemsForChange = this.state.items;
        if (event.target.name === "name") {
            itemsForChange.find(item => item.id === id).name = event.target.value;
        } else
            itemsForChange.find(item => item.id === id).type = event.target.value;
        if (this.state.isChanged === false) {
            this.setState({ items: itemsForChange, isChanged: true });
        } else {
            this.setState({ items: itemsForChange });
        }
    }
    getPagination = (pageInfo) => {
        let pagination = [];
        if (pageInfo.totalPages > 4) {
            if (pageInfo.pageNumber != 1 && pageInfo.pageNumber != pageInfo.totalPages && pageInfo.pageNumber != pageInfo.totalPages - 1) {
                pagination.push(pageInfo.pageNumber - 1);
                pagination.push(pageInfo.pageNumber);
                pagination.push(pageInfo.pageNumber + 1);
                pagination.push(pageInfo.totalPages);
            }
            else if (pageInfo.pageNumber == 1) {
                pagination.push(pageInfo.pageNumber);
                pagination.push(pageInfo.pageNumber + 1);
                pagination.push(pageInfo.pageNumber + 2);
                pagination.push(pageInfo.totalPages);
            }
            else if (pageInfo.pageNumber == pageInfo.totalPages || pageInfo.pageNumber == pageInfo.totalPages - 1) {
                pagination.push(pageInfo.totalPages - 3);
                pagination.push(pageInfo.totalPages - 2);
                pagination.push(pageInfo.totalPages - 1);
                pagination.push(pageInfo.totalPages);
            }
        } else {
            for (let i = 0; i < pageInfo.totalPages; i++) {
                pagination.push(i + 1);
            }
		}

		return pagination;
    }


    render() {
        
        return (
            <div class="item">
                <h1>Items</h1>
                <p>add new item</p>
                <div id = "inputBox" >
                    <form class="form-inline" onSubmit={this.handleSubmit} >
                        <label>
                            <input  placeholder="item name"  type="text" value={this.state.name} required onChange={(ev) => this.setState({ name: ev.target.value })} />
                        </label>
                        <label>
                            <input  placeholder="item type"  type="text" value={this.state.type} required onChange={(ev) => this.setState({ type: ev.target.value })} />
                        </label>
                        <button type="submit" >add</button>
                    </form>
                </div>
                <table className='table table-striped' >
                    <thead>
                        <tr>
                            <th>Item Name</th>
                            <th>Item type</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.items.map(item =>
                            <tr key={item.id}>
                                <td>{this.state.isEditing && this.state.isEditId === item.id ? <input value={item.name} name="name" onChange={(ev) => this.changeElements(item.id, ev)} /> : item.name} </td>
                                <td>{this.state.isEditing && this.state.isEditId === item.id ? <input value={item.type} name="type" onChange={(ev) => this.changeElements(item.id, ev)} /> : item.type}</td>
								<td>
									<a onClick={() => this.handleDelete(item.id)}>delete</a>
                                    <a onClick={() => this.handleEdit(item.id)}>edit</a>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                {this.state.pages.map(page =>
                    <button onClick={()=>this.GetItems(page)}>{page}</button>
                        )}
            </div>

        );
    }
}