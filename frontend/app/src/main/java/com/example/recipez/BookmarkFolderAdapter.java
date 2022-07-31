package com.example.recipez;

import android.annotation.SuppressLint;
import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.SharedPreferences;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageButton;
import android.widget.LinearLayout;
import android.widget.RelativeLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class BookmarkFolderAdapter extends RecyclerView.Adapter<BookmarkFolderAdapter.FolderViewHolder> {
    final static String TAG = "BookmarkFolderAdapter";

    private List<BookmarkFolder> foldersList;
    private List<JSONObject> recipesInFolder = new ArrayList<>();

    SharedPreferences sharedpreferences;
    private int userID; // todo: test if works

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
    public void onBindViewHolder(@NonNull FolderViewHolder holder, @SuppressLint("RecyclerView") int position) {
        sharedpreferences = holder.folderNestedRecyclerView.getContext().getSharedPreferences("UserData", Context.MODE_PRIVATE);
        userID = sharedpreferences.getInt("userID", 0);

        BookmarkFolder folder = foldersList.get(holder.getAdapterPosition());
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

        holder.deleteFolderButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                AlertDialog.Builder alertDialogBuilder = new AlertDialog.Builder(holder.deleteFolderButton.getContext());
                alertDialogBuilder.setTitle("Deleting " + folder.getFolderName());
                alertDialogBuilder.setMessage("This will delete this folder and any recipes saved in it. Continue?")
                        .setPositiveButton("Confirm", new DialogInterface.OnClickListener() {
                            @Override
                            public void onClick(DialogInterface dialogInterface, int i) {
                                for (int j = 0; j < recipesInFolder.size(); j++) {
                                    try {
                                        removeRecipeFromBookmarkList(userID, recipesInFolder.get(j).getInt("recipeID"), holder.deleteFolderButton.getContext());
                                    } catch (JSONException e) {
                                        e.printStackTrace();
                                    }
                                }

                                removePathFromPathsList(userID, folder.getFolderName(), holder.deleteFolderButton.getContext());
                                foldersList.remove(holder.getAdapterPosition());
                                notifyItemRemoved(holder.getAdapterPosition());
                                if (holder.getAdapterPosition() != getItemCount() - 1) {
                                    notifyItemRangeChanged(holder.getAdapterPosition(), getItemCount() - holder.getAdapterPosition());
                                }
                                Toast.makeText(holder.deleteFolderButton.getContext(), "'" + folder.getFolderName() + "'" + " deleted", Toast.LENGTH_SHORT).show();

                            }
                        }).setNegativeButton("Cancel", null);

                AlertDialog alertDialog = alertDialogBuilder.create();
                alertDialog.show();
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
        private ImageButton deleteFolderButton;

        public FolderViewHolder(@NonNull View itemView) {
            super(itemView);

            linearFolderLayout = itemView.findViewById(R.id.linear_folder_layout);
            expandableFolderLayout = itemView.findViewById(R.id.expandable_folder_layout);
            folderName = itemView.findViewById(R.id.folder_name_text);
            folderNestedRecyclerView = itemView.findViewById(R.id.folder_child_recycler_view);
            deleteFolderButton = itemView.findViewById(R.id.folder_delete_button);
        }
    }

    private void removeRecipeFromBookmarkList(int userID, int recipeID, Context context) {
        // Instantiate the RequestQueue.
        RequestQueue queue = Volley.newRequestQueue(context);
        String url = "http://20.53.224.7:8082/removeRecipe";
        // 10.0.2.2 is a special alias to localhost for developers

        Map<String, String> jsonParams = new HashMap();
        jsonParams.put("userID", String.valueOf(userID));
        jsonParams.put("recipeID", String.valueOf(recipeID));
        jsonParams.put("googleSignInToken", sharedpreferences.getString("googleSignInToken", ""));

        // Request a string response from the provided URL.
        JsonObjectRequest jsonRequest = new JsonObjectRequest
                (Request.Method.POST, url, new JSONObject(jsonParams), new Response.Listener<JSONObject>() {
                    @Override
                    public void onResponse(JSONObject response) {
                        Log.d(TAG, response.toString());
                    }
                }, new Response.ErrorListener() {
                    @Override
                    public void onErrorResponse(VolleyError error) {
                        Log.d(TAG, error.toString());
                    }
                }) {
        };

        // Add the request to the RequestQueue.
        queue.add(jsonRequest);
    }

    private void removePathFromPathsList(int userID, String path, Context context) {
        // Instantiate the RequestQueue.
        RequestQueue queue = Volley.newRequestQueue(context);
        String url = "http://20.53.224.7:8082/removeExistingPath";
        // 10.0.2.2 is a special alias to localhost for developers

        Map<String, String> jsonParams = new HashMap();
        jsonParams.put("userID", String.valueOf(userID));
        jsonParams.put("path", path);
        jsonParams.put("googleSignInToken", sharedpreferences.getString("googleSignInToken", ""));

        // Request a string response from the provided URL.
        JsonObjectRequest jsonRequest = new JsonObjectRequest
                (Request.Method.POST, url, new JSONObject(jsonParams), new Response.Listener<JSONObject>() {
                    @Override
                    public void onResponse(JSONObject response) {
                        Log.d(TAG, response.toString());
                    }
                }, new Response.ErrorListener() {
                    @Override
                    public void onErrorResponse(VolleyError error) {
                        Log.d(TAG, error.toString());
                    }
                }) {
        };

        // Add the request to the RequestQueue.
        queue.add(jsonRequest);
    }
}
