package com.example.recipez;

import android.app.Dialog;
import android.content.Context;
import android.content.SharedPreferences;
import android.os.Bundle;

import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonArrayRequest;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class BookmarkListFragmentNew extends Fragment {
    final static String TAG = "BookmarkListFragmentNew";

    private BookmarkFolderAdapter adapter;
    private RecyclerView bookmarkListRecyclerView;
    private List<BookmarkFolder> folderList = new ArrayList<>();
    private List<String> folderNames = new ArrayList<>();

    SharedPreferences sharedpreferences;
    private int userID; // todo: test if works

    /**
     * Use this factory method to create a new instance of
     * this fragment using the provided parameters.
     *
     * @param param1 Parameter 1.
     * @param param2 Parameter 2.
     * @return A new instance of fragment RecipesFragment.
     */
    public static BookmarkListFragmentNew newInstance(String param1, String param2) {
        BookmarkListFragmentNew fragment = new BookmarkListFragmentNew();
        return fragment;
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        // Inflate the layout for this fragment
        return inflater.inflate(R.layout.fragment_bookmark_list_new, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        sharedpreferences = getActivity().getSharedPreferences("UserData", Context.MODE_PRIVATE);
        userID = sharedpreferences.getInt("userID", 0);

        getPathsList(userID);
        getRecipesFromBookmarkList(userID);

        bookmarkListRecyclerView = view.findViewById(R.id.bookmark_list_recycler_view);
        // bookmarkListRecyclerView.setHasFixedSize(true);
        bookmarkListRecyclerView.setLayoutManager(new LinearLayoutManager(getActivity()));

        Button addNewFolderButton = view.findViewById(R.id.add_folder_dialog_button);
        addNewFolderButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Dialog dialog = new Dialog(getActivity());
                dialog.setContentView(R.layout.dialog_new_folder);

                EditText folderNameInput = dialog.findViewById(R.id.dialog_new_folder_name_input);
                Button confirmButton = dialog.findViewById(R.id.dialog_new_folder_confirm_button);
                confirmButton.setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View view) {
                        String folderName = "";

                        if (!folderNameInput.getText().toString().equals("")) {
                            folderName = folderNameInput.getText().toString();

                            List<JSONObject> emptyRecipeList = new ArrayList<>();
                            folderList.add(new BookmarkFolder(emptyRecipeList, folderName));

                            Log.d(TAG, "add path to paths list");
                            addPathToPathsList(userID, folderName);

                            adapter = new BookmarkFolderAdapter(folderList);
                            adapter.notifyItemInserted(folderList.size() - 1);
                            bookmarkListRecyclerView.setAdapter(adapter);
                            bookmarkListRecyclerView.scrollToPosition(folderList.size() - 1);

                            dialog.dismiss();
                        } else {
                            Toast.makeText(getActivity(), "Please enter a folder name", Toast.LENGTH_SHORT).show();
                        }
                    }
                });

                dialog.show();
            }
        });
    }

    private void getRecipesFromBookmarkList(int userID) {
        // Instantiate the RequestQueue.
        RequestQueue queue = Volley.newRequestQueue(getActivity().getApplicationContext());
        String url = "http://20.53.224.7:8084/getRecipes?userid=" + userID + "&googlesignintoken=" + sharedpreferences.getString("googleSignInToken", "");

        // Request a string response from the provided URL.
        JsonObjectRequest jsonRequest = new JsonObjectRequest
                (Request.Method.GET, url, null, new Response.Listener<JSONObject>() {
                    @Override
                    public void onResponse(JSONObject response) {
                        Log.d(TAG, String.valueOf(response));
                        try {
                            JSONArray pathsArray = response.getJSONArray("paths");
                            for (int j = 0; j < pathsArray.length(); j++) {
                                folderNames.add(pathsArray.get(j).toString());
                            }

                            try {
                                JSONArray recipesArray = response.getJSONArray("recipes");

                                for (int i = 0; i < folderNames.size(); i++) {
                                    List<JSONObject> recipesInThisFolder = new ArrayList<>();

                                    for (int j = 0; j < recipesArray.length(); j++) {
                                        JSONObject recipeObject = recipesArray.getJSONObject(j);
                                        String recipeFolderPath = recipeObject.getString("path");

                                        if (recipeFolderPath.equals(folderNames.get(i))) {
                                            recipesInThisFolder.add(recipeObject);
                                        }
                                    }

                                    BookmarkFolder thisFolder = new BookmarkFolder(recipesInThisFolder, folderNames.get(i));
                                    folderList.add(thisFolder);
                                }

                            } catch (JSONException e) {
                                e.printStackTrace();
                            }

                            adapter = new BookmarkFolderAdapter(folderList);
                            bookmarkListRecyclerView.setAdapter(adapter);
                        } catch (JSONException e) {
                            e.printStackTrace();
                        }

                        Log.d(TAG, response.toString());
                    }
                }, new Response.ErrorListener() {
                    @Override
                    public void onErrorResponse(VolleyError error) {
                        Log.d(TAG, error.toString());
                    }
                });

        // Add the request to the RequestQueue.
        queue.add(jsonRequest);

    }

    private void addPathToPathsList(int userID, String path) {
        // Instantiate the RequestQueue.
        RequestQueue queue = Volley.newRequestQueue(getActivity().getApplicationContext());
        String url = "http://20.53.224.7:8084/addNewPath";

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

    private void getPathsList(int userID) {
        // Instantiate the RequestQueue.
        RequestQueue queue = Volley.newRequestQueue(getActivity().getApplicationContext());
        String url = "http://20.53.224.7:8084/getAllPaths?userid=" + userID + "&googlesignintoken=" + sharedpreferences.getString("googleSignInToken", "");

        // Request a string response from the provided URL.
        JsonArrayRequest jsonRequest = new JsonArrayRequest
                (Request.Method.GET, url, null, new Response.Listener<JSONArray>() {
                    @Override
                    public void onResponse(JSONArray response) {
                        Log.d(TAG, response.toString());
                    }
                }, new Response.ErrorListener() {
                    @Override
                    public void onErrorResponse(VolleyError error) {
                        Log.d(TAG, error.toString());
                    }
                });

        // Add the request to the RequestQueue.
        queue.add(jsonRequest);
    }
}

