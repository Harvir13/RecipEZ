package com.example.recipez;

import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.RelativeLayout;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.RecyclerView;

import com.squareup.picasso.Picasso;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.List;

public class BookmarkFolderRecipesAdapter extends RecyclerView.Adapter<BookmarkFolderRecipesAdapter.BookmarkFolderRecipesViewHolder> {
    final static String TAG = "BookmarkFolderRecipesAdapter";

    private List<JSONObject> recipesInFolder;

    public BookmarkFolderRecipesAdapter(List<JSONObject> recipesInFolder){
        this.recipesInFolder = recipesInFolder;
    }

    @NonNull
    @Override
    public BookmarkFolderRecipesAdapter.BookmarkFolderRecipesViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.list_row_recipe, parent, false);
        return new BookmarkFolderRecipesViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull BookmarkFolderRecipesAdapter.BookmarkFolderRecipesViewHolder holder, int position) {
        try {
            Picasso.get().load(recipesInFolder.get(position).getString("image")).resize(60, 60).centerCrop().into(holder.recipeImage);
            holder.recipeTitle.setText(recipesInFolder.get(position).getString("title"));

            holder.recipeRow.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    AppCompatActivity activity = (AppCompatActivity) view.getContext();
                    Fragment fragment = new RecipeDetailFragment();
                    Bundle bundle = new Bundle();
                    try {
                        bundle.putInt("RECIPE_ID", recipesInFolder.get(holder.getAdapterPosition()).getInt("recipeID"));
                        bundle.putString("RECIPE_TITLE", recipesInFolder.get(holder.getAdapterPosition()).getString("title"));
                        bundle.putString("RECIPE_IMAGE", recipesInFolder.get(holder.getAdapterPosition()).getString("image"));
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

    @Override
    public int getItemCount() {
        return recipesInFolder.size();
    }

    public class BookmarkFolderRecipesViewHolder extends RecyclerView.ViewHolder{
        private TextView recipeTitle;
        private ImageView recipeImage;
        private RelativeLayout recipeRow;

        public BookmarkFolderRecipesViewHolder(@NonNull View itemView) {
            super(itemView);
            recipeTitle = itemView.findViewById(R.id.recipe_row_title);
            recipeImage = itemView.findViewById(R.id.recipe_row_image);
            recipeRow = itemView.findViewById(R.id.recipe_row_relative_layout);
        }
    }
}