package com.tubespbo.foodorder.dto;

import java.util.List;

public class OrderRequest {
    private List<Integer> items;
    private int tableNumber;

    public List<Integer> getItems() {
        return items;
    }

    public void setItems(List<Integer> items) {
        this.items = items;
    }

    public int getTableNumber() {
        return tableNumber;
    }

    public void setTableNumber(int tableNumber) {
        this.tableNumber = tableNumber;
    }
} 