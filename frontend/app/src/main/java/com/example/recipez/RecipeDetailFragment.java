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
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.squareup.picasso.Picasso;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class RecipeDetailFragment extends Fragment {
    final static String TAG = "RecipeDetailFragment";

    private TextView recipeIngredients;
    private TextView recipeInstructions;
    private TextView recipeNutrition;

    int recipeID;
    String recipeName;
    String recipeImageUrl;
    private BookmarkFolderDialogAdapter dialogAdapter;
    private Button addToBookmarkConfirmButton;
    private Button removeFromBookmarkButton;
    private RecyclerView folderListRecyclerView;
    private TextView existingFolderText;

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
    public static RecipeDetailFragment newInstance(String param1, String param2) {
        RecipeDetailFragment fragment = new RecipeDetailFragment();
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
        return inflater.inflate(R.layout.fragment_recipe_detail, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        sharedpreferences = getActivity().getSharedPreferences("UserData", Context.MODE_PRIVATE);
        userID = sharedpreferences.getInt("userID", 0);

        Bundle bundle = this.getArguments();
        recipeID = bundle.getInt("RECIPE_ID", 0);
        recipeName = bundle.getString("RECIPE_TITLE", "");
        recipeImageUrl = bundle.getString("RECIPE_IMAGE", "");

        TextView recipeIDText = view.findViewById(R.id.recipe_id_text);
        recipeIDText.setText(String.valueOf(bundle.getInt("RECIPE_ID", 0)));

        TextView recipeTitle = view.findViewById(R.id.recipe_detail_title);
        recipeTitle.setText(recipeName);

        ImageView recipeImage = view.findViewById(R.id.recipe_detail_image);
        Picasso.get().load(recipeImageUrl).fit().centerCrop().into(recipeImage);

        recipeIngredients = view.findViewById(R.id.recipe_detail_ingredient_list);
        recipeInstructions = view.findViewById(R.id.recipe_detail_instructions_list);
        recipeNutrition = view.findViewById(R.id.recipe_detail_nutrition_list);

        getFullRecipeDetails(recipeID);

        ImageButton addToBookmarkButton = view.findViewById(R.id.add_to_bookmark_button);
        addToBookmarkButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Dialog dialog = new Dialog(getActivity());
                dialog.setContentView(R.layout.dialog_add_to_bookmark);

                getRecipesFromBookmarkList(userID, dialog);

                folderListRecyclerView = dialog.findViewById(R.id.recycler_view_bookmark_folder_list);
                addToBookmarkConfirmButton = dialog.findViewById(R.id.dialog_filter_search_button);
                existingFolderText = dialog.findViewById(R.id.dialog_filter_list_title);

                removeFromBookmarkButton = dialog.findViewById(R.id.dialog_add_to_bookmark_remove_button);
                removeFromBookmarkButton.setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View view) {
                        removeRecipeFromBookmarkList(userID, recipeID, dialog);
                    }
                });

                dialog.show();
            }
        });
    }

    private void getFullRecipeDetails(int recipeID) {
        // Instantiate the RequestQueue.
        RequestQueue queue = Volley.newRequestQueue(getActivity().getApplicationContext());
        String url = "http://20.53.224.7:8084/getRecipeDetails?recipeid=" + recipeID + "&googlesignintoken=" + sharedpreferences.getString("googleSignInToken", "");

        // Request a string response from the provided URL.
        JsonObjectRequest jsonObjectRequest = new JsonObjectRequest
                (Request.Method.GET, url, null, new Response.Listener<JSONObject>() {
                    @Override
                    public void onResponse(JSONObject response) {
                        try {
                            JSONArray ingredientArray = response.getJSONArray("ingredientsAndAmounts");
                            StringBuilder ingredientParser = new StringBuilder();
                            for (int i = 0; i < ingredientArray.length(); i++) {
                                ingredientParser.append(ingredientArray.getString(i));
                                ingredientParser.append("\n");
                            }
                            recipeIngredients.setText(ingredientParser.toString());

                            JSONArray instructionArray = response.getJSONArray("instructions");
                            StringBuilder instructionParser = new StringBuilder();
                            for (int i = 0; i < instructionArray.length(); i++) {
                                String subName = instructionArray.getJSONObject(i).getString("name");
                                if (!subName.equals("")) {
                                    instructionParser.append(subName);
                                }
                                JSONArray instructionSubArray = instructionArray.getJSONObject(i).getJSONArray("steps");
                                for (int j = 0; j < instructionSubArray.length(); j++) {
                                    instructionParser.append("- ");
                                    instructionParser.append(instructionSubArray.getString(j));
                                    instructionParser.append("\n");
                                }
                            }
                            recipeInstructions.setText(instructionParser.toString());

                            JSONObject nutritionObject = response.getJSONObject("nutritionDetails");
                            StringBuilder nutritionParser = new StringBuilder();
                            nutritionParser.append("Calories: " + nutritionObject.getString("calories") + "\n");
                            nutritionParser.append("Carbs: " + nutritionObject.getString("carbs") + "\n");
                            nutritionParser.append("Fat: " + nutritionObject.getString("fat") + "\n");
                            nutritionParser.append("Protein: " + nutritionObject.getString("protein") + "\n");
                            recipeNutrition.setText(nutritionParser.toString());
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
        queue.add(jsonObjectRequest);
    }

    private void addRecipeToBookmarkList(int userID, int recipeID, String path, String title, String image) {
        // Instantiate the RequestQueue.
        RequestQueue queue = Volley.newRequestQueue(getActivity().getApplicationContext());
        String url = "http://20.53.224.7:8084/addRecipe";
        // 10.0.2.2 is a special alias to localhost for developers

        Map<String, String> jsonParams = new HashMap();
        jsonParams.put("userID", String.valueOf(userID));
        jsonParams.put("recipeID", String.valueOf(recipeID));
        jsonParams.put("path", path);
        jsonParams.put("title", title);
        jsonParams.put("image", image);
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

    private void removeRecipeFromBookmarkList(int userID, int recipeID, Dialog dialog) {
        // Instantiate the RequestQueue.
        RequestQueue queue = Volley.newRequestQueue(getActivity().getApplicationContext());
        String url = "http://20.53.224.7:8084/removeRecipe";
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
                        Toast.makeText(getActivity(), "Removed recipe from bookmark", Toast.LENGTH_SHORT).show();
                        Log.d(TAG, response.toString());
                        dialog.dismiss();
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

    private void getRecipesFromBookmarkList(int userID, Dialog dialog) {
        // Instantiate the RequestQueue.
        RequestQueue queue = Volley.newRequestQueue(getActivity().getApplicationContext());
        String url = "http://20.53.224.7:8084/getRecipes?userid=" + userID + "&googlesignintoken=" + sharedpreferences.getString("googleSignInToken", "");

        // Request a string response from the provided URL.
        JsonObjectRequest jsonRequest = new JsonObjectRequest
                (Request.Method.GET, url, null, new Response.Listener<JSONObject>() {
                    @Override
                    public void onResponse(JSONObject response) {
                        List<String> folderNames = new ArrayList<>();

                        try {
                            Gson gson = new Gson();
                            Type type = new TypeToken<List<String>>() {
                            }.getType();
                            folderNames = gson.fromJson(String.valueOf(response.getJSONArray("paths")), type);

                            JSONArray recipesArray = response.getJSONArray("recipes");
                            boolean alreadyBookmarked = false;
                            existingFolderText.setText("This recipe is not in any folders");
                            removeFromBookmarkButton.setEnabled(false);

                            outerloop:
                            for (int i = 0; i < folderNames.size(); i++) {
                                for (int j = 0; j < recipesArray.length(); j++) {
                                    JSONObject recipeObject = recipesArray.getJSONObject(j);
                                    String recipeFolderPath = recipeObject.getString("path");

                                    if ((recipeObject.getInt("recipeID") == recipeID) && recipeFolderPath.equals(folderNames.get(i))) {
                                        existingFolderText.setText("This recipe is already bookmarked in: " + folderNames.get(i));
                                        removeFromBookmarkButton.setEnabled(true);
                                        addToBookmarkConfirmButton.setEnabled(false);
                                        alreadyBookmarked = true;
                                        break outerloop;
                                    }
                                }
                            }


                            final String[] selectedFolderName = new String[1];
                            BookmarkFolderClickListener bookmarkFolderClickListener = new BookmarkFolderClickListener() {
                                @Override
                                public void onClick(String str) {
                                    folderListRecyclerView.post(new Runnable() {
                                        @Override
                                        public void run() {
                                            dialogAdapter.notifyDataSetChanged();
                                            if (dialogAdapter.getSelectedPosition() >= 0) {
                                                addToBookmarkConfirmButton.setEnabled(true);
                                            }
                                        }
                                    });
                                    selectedFolderName[0] = str;
                                }
                            };
                            dialogAdapter = new BookmarkFolderDialogAdapter(alreadyBookmarked ? new ArrayList<>() : folderNames, bookmarkFolderClickListener);

                            if (folderNames.size() == 0 || dialogAdapter.getSelectedPosition() == -1) {
                                addToBookmarkConfirmButton.setEnabled(false);
                            }
                            addToBookmarkConfirmButton.setOnClickListener(new View.OnClickListener() {
                                @Override
                                public void onClick(View view) {
                                    addRecipeToBookmarkList(userID, recipeID, selectedFolderName[0], recipeName, recipeImageUrl);
                                    Toast.makeText(getActivity(), "Added recipe to " + selectedFolderName[0], Toast.LENGTH_SHORT).show();
                                    dialog.dismiss();
                                }
                            });

                            folderListRecyclerView.setLayoutManager(new LinearLayoutManager(getActivity()));
                            folderListRecyclerView.setAdapter(dialogAdapter);

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
}