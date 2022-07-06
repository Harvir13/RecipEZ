package com.example.recipez;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.squareup.picasso.Picasso;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.List;

public class BookmarkFolderRecipesAdapter extends RecyclerView.Adapter<BookmarkFolderRecipesAdapter.BookmarkFolderRecipesViewHolder> {
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

        public BookmarkFolderRecipesViewHolder(@NonNull View itemView) {
            super(itemView);
            recipeTitle = itemView.findViewById(R.id.recipe_row_title);
            recipeImage = itemView.findViewById(R.id.recipe_row_image);
        }
    }
}