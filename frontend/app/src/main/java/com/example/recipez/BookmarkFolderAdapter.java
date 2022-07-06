package com.example.recipez;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.RelativeLayout;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

public class BookmarkFolderAdapter extends RecyclerView.Adapter<BookmarkFolderAdapter.FolderViewHolder> {
    final static String TAG = "BookmarkFolderAdapter";

    private List<BookmarkFolder> foldersList;
    private List<JSONObject> recipesInFolder = new ArrayList<>();

    public BookmarkFolderAdapter(List<BookmarkFolder> foldersList){
        this.foldersList  = foldersList;
    }

    @NonNull
    @Override
    public FolderViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view  = LayoutInflater.from(parent.getContext()).inflate(R.layout.folder_bookmark_list , parent , false);
        return new FolderViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull FolderViewHolder holder, int position) {
        BookmarkFolder folder = foldersList.get(position);
        holder.folderName.setText(folder.getFolderName());

        boolean isExpandable = folder.isExpandable();
        holder.expandableFolderLayout.setVisibility(isExpandable ? View.VISIBLE : View.GONE);

        BookmarkFolderRecipesAdapter adapter = new BookmarkFolderRecipesAdapter(recipesInFolder);
        holder.folderNestedRecyclerView.setLayoutManager(new LinearLayoutManager(holder.itemView.getContext()));
        holder.folderNestedRecyclerView.setHasFixedSize(true);
        holder.folderNestedRecyclerView.setAdapter(adapter);
        holder.linearFolderLayout.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                folder.setExpandable(!folder.isExpandable());
                recipesInFolder = folder.getRecipesInFolder();
                notifyItemChanged(holder.getAdapterPosition());
            }
        });
    }

    @Override
    public int getItemCount() {
        return foldersList.size();
    }

    public class FolderViewHolder extends RecyclerView.ViewHolder{
        private LinearLayout linearFolderLayout;
        private RelativeLayout expandableFolderLayout;
        private TextView folderName;
        private RecyclerView folderNestedRecyclerView;

        public FolderViewHolder(@NonNull View itemView) {
            super(itemView);

            linearFolderLayout = itemView.findViewById(R.id.linear_folder_layout);
            expandableFolderLayout = itemView.findViewById(R.id.expandable_folder_layout);
            folderName = itemView.findViewById(R.id.folder_name_text);
            folderNestedRecyclerView = itemView.findViewById(R.id.folder_child_recycler_view);
        }
    }
}
