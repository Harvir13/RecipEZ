package com.example.recipez;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import java.util.ArrayList;

public class AllergiesListAdapter extends RecyclerView.Adapter<AllergiesListAdapter.AllergiesListHolder> {
    private ArrayList<String> mAllergiesList;
    private OnItemClickListener mListener;

    public interface OnItemClickListener {
        void onDeleteClick(int position);
    }

    public void setOnItemClickListener(OnItemClickListener listener) {
        mListener = listener;
    }

    public static class AllergiesListHolder extends RecyclerView.ViewHolder {
        public ImageView mAllergyImageView;
        public TextView mAllergyName;
        public ImageView mAllergyDelete;

        public AllergiesListHolder(@NonNull View itemView, OnItemClickListener listener) {
            super(itemView);

            mAllergyName = itemView.findViewById(R.id.allergyName);
            mAllergyDelete = itemView.findViewById(R.id.allergyDelete);

            mAllergyDelete.setOnClickListener(new View.OnClickListener() {
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

    public AllergiesListAdapter(ArrayList<String> allergiesList) {
        mAllergiesList = allergiesList;
    }

    @NonNull
    @Override
    public AllergiesListHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View v = LayoutInflater.from(parent.getContext()).inflate(R.layout.list_row_allergy, parent, false);
        AllergiesListHolder alh = new AllergiesListHolder(v, mListener);

        return alh;
    }

    @Override
    public void onBindViewHolder(@NonNull AllergiesListHolder holder, int position) {
        String currentItem = mAllergiesList.get(position);
        holder.mAllergyName.setText(currentItem.substring(0, 1).toUpperCase() + currentItem.substring(1));
    }

    @Override
    public int getItemCount() {
        return mAllergiesList.size();
    }
}
