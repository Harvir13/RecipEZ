package com.example.recipez;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.CheckBox;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import java.lang.reflect.Array;
import java.util.ArrayList;

public class FilterIngredientListAdapter extends RecyclerView.Adapter<FilterIngredientListAdapter.ViewHolder> {
    View view;
    Context context;
    ArrayList<String> ingredientsList;

    ArrayList<String> selectedIngredients = new ArrayList<>();

    public FilterIngredientListAdapter(Context context, ArrayList<String> ingredientsList) {
        this.context = context;
        this.ingredientsList = ingredientsList;
    }

    public View getView() {
        return view;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        view = LayoutInflater.from(context).inflate(R.layout.list_row_filter_ingredient, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        if (ingredientsList != null && getItemCount() > 0) {
            holder.itemCheckBox.setText(ingredientsList.get(holder.getAdapterPosition()));
            holder.itemCheckBox.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    if (holder.itemCheckBox.isChecked()) {
                        selectedIngredients.add(ingredientsList.get(holder.getAdapterPosition()));
                    } else {
                        selectedIngredients.remove(ingredientsList.get(holder.getAdapterPosition()));
                    }
                }
            });

        }
    }

    public ArrayList<String> getSelectedIngredients() {
        return selectedIngredients;
    }
    public int getSelectedIngredientsSize() {
        return selectedIngredients.size();
    }

    @Override
    public int getItemCount() {
        return ingredientsList.size();
    }

    public class ViewHolder extends RecyclerView.ViewHolder {
        CheckBox itemCheckBox;

        public ViewHolder(@NonNull View itemView) {
            super(itemView);

            itemCheckBox = itemView.findViewById(R.id.filter_ingredient_item_checkbox);
        }
    }
}
