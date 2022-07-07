package com.example.recipez;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.CompoundButton;
import android.widget.RadioButton;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import java.util.List;

public class BookmarkFolderDialogAdapter extends RecyclerView.Adapter<BookmarkFolderDialogAdapter.ViewHolder> {
    List<String> folderNames;
    int selectedPosition = -1;

    public BookmarkFolderDialogAdapter(List<String> folderNames) {
        this.folderNames = folderNames;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.list_row_folder_dialog, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        holder.folderRadioButton.setText(folderNames.get(position));
        holder.folderRadioButton.setChecked(position == selectedPosition);

        holder.folderRadioButton.setOnCheckedChangeListener(new CompoundButton.OnCheckedChangeListener() {
            @Override
            public void onCheckedChanged(CompoundButton compoundButton, boolean checked) {
                if (checked) {
                    selectedPosition = holder.getAdapterPosition();
                }
            }
        });
    }

    @Override
    public long getItemId(int position) {
        return position;
    }

    @Override
    public int getItemViewType(int position) {
        return position;
    }

    @Override
    public int getItemCount() {
        return folderNames.size();
    }

    public class ViewHolder extends RecyclerView.ViewHolder {
        RadioButton folderRadioButton;

        public ViewHolder(@NonNull View itemView) {
            super(itemView);

            folderRadioButton = itemView.findViewById(R.id.radio_button_dialog_folder_list);
        }
    }
}
