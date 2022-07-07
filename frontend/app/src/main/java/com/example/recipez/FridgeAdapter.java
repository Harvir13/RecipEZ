package com.example.recipez;

import static java.lang.Integer.parseInt;

import android.util.Log;
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

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.TimeZone;

public class FridgeAdapter extends RecyclerView.Adapter<FridgeAdapter.FridgeViewHolder> {
    private ArrayList<JSONObject> mIngredientList;
    private OnItemClickListener mListener;

    public interface OnItemClickListener {
        void onItemClick(int position);
        void onDeleteClick(int position);
    }

    public void setOnItemClickListener(OnItemClickListener listener) {
        mListener = listener;
    }

    public static class FridgeViewHolder extends RecyclerView.ViewHolder {
        public ImageView mIngredientImageView;
        public TextView mIngredientName;
        public TextView mIngredientExpiry;
        public ImageView mIngredientDelete;

        public FridgeViewHolder(@NonNull View itemView, OnItemClickListener listener) {
            super(itemView);
            mIngredientImageView = itemView.findViewById(R.id.ingredientImageView);
            mIngredientName = itemView.findViewById(R.id.ingredientName);
            mIngredientExpiry = itemView.findViewById(R.id.ingredientExpiry);
            mIngredientDelete = itemView.findViewById(R.id.ingredientDelete);

            itemView.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    if (listener != null) {
                        int position = getAdapterPosition();
                        if (position != RecyclerView.NO_POSITION) {
                            listener.onItemClick(position);
                        }
                    }
                }
            });

            mIngredientDelete.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    if (listener != null) {
                        int position = getAdapterPosition();
                        if (position != RecyclerView.NO_POSITION) {
                            listener.onDeleteClick(position);
                        }
                    }
                }
            });
        }
    }

    public FridgeAdapter(ArrayList<JSONObject> ingredientList) {
        mIngredientList = ingredientList;
    }

    @NonNull
    @Override
    public FridgeViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View v = LayoutInflater.from(parent.getContext()).inflate(R.layout.list_row_ingredient, parent, false);
        FridgeViewHolder ivh = new FridgeViewHolder(v, mListener);

        return ivh;
    }

    @Override
    public void onBindViewHolder(@NonNull FridgeViewHolder holder, int position) {
        JSONObject currentItem = mIngredientList.get(position);

        try {
            Picasso.get().load("https://spoonacular.com/cdn/ingredients_100x100/" + currentItem.getString("image")).fit().centerCrop().into(holder.mIngredientImageView);

            String name = currentItem.getString("name");
            holder.mIngredientName.setText(name.substring(0, 1).toUpperCase() + name.substring(1));

            Date date = new Date(parseInt(currentItem.getString("expiry")) * 1000L);
            SimpleDateFormat sdf = new SimpleDateFormat("MMMM d, yyyy");
            sdf.setTimeZone(TimeZone.getTimeZone("GMT-8"));
            holder.mIngredientExpiry.setText(sdf.format(date));
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    @Override
    public int getItemCount() {
        return mIngredientList.size();
    }
}
