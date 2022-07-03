package com.example.recipez;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;

public class RecipeCardListRecycleAdapter extends RecyclerView.Adapter<RecipeCardListRecycleAdapter.ViewHolder> {
    private ArrayList<JSONObject> recipeArrayList;

    public RecipeCardListRecycleAdapter(ArrayList<JSONObject> recipeArrayList) {
        this.recipeArrayList = recipeArrayList;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.recipe_card_cell, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull RecipeCardListRecycleAdapter.ViewHolder holder, int position) {
        try {
            // set image too (picasso)
            holder.recipeTitle.setText(recipeArrayList.get(position).getString("title"));
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }


    @Override
    public int getItemCount() {
        return recipeArrayList.size();
    }

    public class ViewHolder extends RecyclerView.ViewHolder {
        private ImageView recipeImage;
        private TextView recipeTitle;

        public ViewHolder(@NonNull View itemView) {
            super(itemView);
            recipeImage = itemView.findViewById(R.id.recipe_card_image);
            recipeTitle = itemView.findViewById(R.id.recipe_card_title);
        }
    }
}
