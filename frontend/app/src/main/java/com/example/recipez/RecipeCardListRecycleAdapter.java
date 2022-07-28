package com.example.recipez;

import android.annotation.SuppressLint;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.cardview.widget.CardView;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.RecyclerView;

import com.squareup.picasso.Picasso;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;

public class RecipeCardListRecycleAdapter extends RecyclerView.Adapter<RecipeCardListRecycleAdapter.ViewHolder> {
    final static String TAG = "RecipeCardListRecycleAdapter";

    private ArrayList<JSONObject> recipeArrayList;

    public RecipeCardListRecycleAdapter(ArrayList<JSONObject> recipeArrayList) {
        this.recipeArrayList = recipeArrayList;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        Log.d(TAG, "item count " + this.getItemCount());
        View view;
        if (this.getItemCount() == 0) {
            view = LayoutInflater.from(parent.getContext()).inflate(R.layout.placeholder_no_recipe, parent, false);
        } else {
            view = LayoutInflater.from(parent.getContext()).inflate(R.layout.recipe_card_cell, parent, false);
        }
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, @SuppressLint("RecyclerView") int position) {
        if (this.getItemCount() == 0) {

        } else {
            try {
                Picasso.get().load(recipeArrayList.get(position).getString("image")).fit().centerCrop().into(holder.recipeImage);
                holder.recipeTitle.setText(recipeArrayList.get(position).getString("title"));

                holder.recipeCard.setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View view) {
                        AppCompatActivity activity = (AppCompatActivity) view.getContext();
                        Fragment fragment = new RecipeDetailFragment();
                        Bundle bundle = new Bundle();
                        try {
                            bundle.putInt("RECIPE_ID", recipeArrayList.get(position).getInt("id"));
                            bundle.putString("RECIPE_TITLE", recipeArrayList.get(position).getString("title"));
                            bundle.putString("RECIPE_IMAGE", recipeArrayList.get(position).getString("image"));
                        } catch (JSONException e) {
                            e.printStackTrace();
                        }
                        fragment.setArguments(bundle);
                        activity.getSupportFragmentManager().beginTransaction().replace(R.id.frame, fragment).addToBackStack(null).commit();
                    }
                });
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }

    }

    @Override
    public int getItemCount() {
        return recipeArrayList.size();
    }

    public class ViewHolder extends RecyclerView.ViewHolder {
        private ImageView recipeImage;
        private TextView recipeTitle;
        private CardView recipeCard;

        public ViewHolder(@NonNull View itemView) {
            super(itemView);
            recipeCard = itemView.findViewById(R.id.recipe_card);
            recipeImage = itemView.findViewById(R.id.recipe_card_image);
            recipeTitle = itemView.findViewById(R.id.recipe_card_title);
        }
    }
}