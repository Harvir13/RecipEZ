package com.example.recipez;

import android.app.Dialog;
import android.content.Context;
import android.content.SharedPreferences;
import android.os.Bundle;

import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonArrayRequest;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;
import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.squareup.picasso.Picasso;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class RecipeDetailFragment extends Fragment {
    final static String TAG = "RecipeDetailFragment";

    // TODO: Rename parameter arguments, choose names that match
    // the fragment initialization parameters, e.g. ARG_ITEM_NUMBER
    private static final String ARG_PARAM1 = "param1";
    private static final String ARG_PARAM2 = "param2";

    // TODO: Rename and change types of parameters
    private String mParam1;
    private String mParam2;

    private TextView recipeIDText;
    private TextView recipeTitle;
    private ImageView recipeImage;
    private TextView recipeIngredients;
    private TextView recipeInstructions;
    private TextView recipeNutrition;

    private SharedPreferences sharedpreferences;

    private ImageButton addToBookmarkButton;
    private BookmarkFolderClickListener bookmarkFolderClickListener;
    private Button addToBookmarkConfirmButton;
    private RecyclerView folderListRecyclerView;

    public RecipeDetailFragment() {
        // Required empty public constructor
    }

    /**
     * Use this factory method to create a new instance of
     * this fragment using the provided parameters.
     *
     * @param param1 Parameter 1.
     * @param param2 Parameter 2.
     * @return A new instance of fragment RecipesFragment.
     */
    // TODO: Rename and change types and number of parameters
    public static RecipeDetailFragment newInstance(String param1, String param2) {
        RecipeDetailFragment fragment = new RecipeDetailFragment();
        Bundle args = new Bundle();
        args.putString(ARG_PARAM1, param1);
        args.putString(ARG_PARAM2, param2);
        fragment.setArguments(args);
        return fragment;
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (getArguments() != null) {
            mParam1 = getArguments().getString(ARG_PARAM1);
            mParam2 = getArguments().getString(ARG_PARAM2);
        }
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        // Inflate the layout for this fragment
        return inflater.inflate(R.layout.fragment_recipe_detail, container, false);
    }

    BookmarkFolderDialogAdapter dialogAdapter;
    @Override
    public void onViewCreated(@NonNull View view, Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        sharedpreferences = getActivity().getSharedPreferences("UserData", Context.MODE_PRIVATE);

        Bundle bundle = this.getArguments();
        int recipeID = bundle.getInt("RECIPE_ID", 0);
        String recipeName = bundle.getString("RECIPE_TITLE", "");
        String recipeImageUrl = bundle.getString("RECIPE_IMAGE", "");

        recipeIDText = view.findViewById(R.id.recipe_id_text);
        recipeIDText.setText(String.valueOf(bundle.getInt("RECIPE_ID", 0)));

        recipeTitle = view.findViewById(R.id.recipe_detail_title);
        recipeTitle.setText(recipeName);

        recipeImage = view.findViewById(R.id.recipe_detail_image);
        Picasso.get().load(recipeImageUrl).fit().centerCrop().into(recipeImage);

        recipeIngredients = view.findViewById(R.id.recipe_detail_ingredient_list);
        recipeInstructions = view.findViewById(R.id.recipe_detail_instructions_list);
        recipeNutrition = view.findViewById(R.id.recipe_detail_nutrition_list);

        Recipe recipe = new Recipe();
        recipe.getFullRecipeDetails(recipeID);

        addToBookmarkButton = view.findViewById(R.id.add_to_bookmark_button);
        addToBookmarkButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Dialog dialog = new Dialog(getActivity());
                dialog.setContentView(R.layout.dialog_add_to_bookmark);

                List<String> folderNames = new ArrayList<>(); // from backend
                folderNames.add("folder1");
                folderNames.add("folder2");
                folderNames.add("folder3");

                folderListRecyclerView = dialog.findViewById(R.id.recycler_view_bookmark_folder_list);

                StringBuilder selectedFolderName = new StringBuilder();
                bookmarkFolderClickListener = new BookmarkFolderClickListener() {
                    @Override
                    public void onClick(String str) {
                        folderListRecyclerView.post(new Runnable() {
                            @Override
                            public void run() {
                                dialogAdapter.notifyDataSetChanged();
                            }
                        });
                        selectedFolderName.append(str);
                    }
                };

                addToBookmarkConfirmButton = dialog.findViewById(R.id.dialog_add_to_bookmark_confirm_button);
                addToBookmarkConfirmButton.setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View view) {
                        Toast.makeText(getActivity(), "Added recipe to " + selectedFolderName.toString(), Toast.LENGTH_SHORT).show();
                        dialog.dismiss();
                    }
                });


                folderListRecyclerView.setLayoutManager(new LinearLayoutManager(getActivity()));
                dialogAdapter = new BookmarkFolderDialogAdapter(folderNames, bookmarkFolderClickListener);
                folderListRecyclerView.setAdapter(dialogAdapter);

                dialog.show();
            }
        });
    }

    public String encodeString(String s) {
        String result;
        try {
            result = URLEncoder.encode(s, "UTF-8").replaceAll("\\+", "%20").replaceAll("\\%21", "!")
                    .replaceAll("\\%27", "'").replaceAll("\\%28", "(").replaceAll("\\%29", ")")
                    .replaceAll("\\%7E", "~");
        } // This exception should never occur.
        catch (Exception e) {
            result = s;
        }

        return result;
    }

    public String convertArrayToString(String[] s) {
        String result = "";

        for (int i = 0; i < s.length; i++) {
            if (i == s.length - 1) {
                result+= s[i];
            }
            else {
                result+= s[i] + ",";
            }
        }
        return result;
    }

    public String convertJSONArrayToString(JSONArray s) throws JSONException {
        String result = "";

        for (int i = 0; i < s.length(); i++) {
            if (i == s.length() - 1) {
                result+= s.get(i);
            }
            else {
                result+= s.get(i) + ",";
            }
        }
        return result;
    }

    public final class Recipe extends MainActivity {
        private int myStaticMember;
        private String TAG = "Recipe Class";

        public Recipe () {
            myStaticMember = 1;
        }

        public void addRecipeToBookmarkList(int userID, int recipeID, String path, String title, String image) {
            // Instantiate the RequestQueue.
            RequestQueue queue = Volley.newRequestQueue(getActivity().getApplicationContext());
            String url = "http://10.0.2.2:8084/addRecipe";
            // 10.0.2.2 is a special alias to localhost for developers

            Map<String, String> jsonParams = new HashMap();
            jsonParams.put("userID", String.valueOf(userID));
            jsonParams.put("recipeID", String.valueOf(recipeID));
            jsonParams.put("path", path);
            jsonParams.put("title", title);
            jsonParams.put("image", image);

            // Request a string response from the provided URL.
            JsonObjectRequest jsonRequest = new JsonObjectRequest
                    (Request.Method.POST, url, new JSONObject(jsonParams),new Response.Listener<JSONObject>() {
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

        public void removeRecipeFromBookmarkList(int userID, int recipeID) {
            // Instantiate the RequestQueue.
            RequestQueue queue = Volley.newRequestQueue(getActivity().getApplicationContext());
            String url = "http://10.0.2.2:8084/removeRecipe";
            // 10.0.2.2 is a special alias to localhost for developers

            Map<String, String> jsonParams = new HashMap();
            jsonParams.put("userID", String.valueOf(userID));
            jsonParams.put("recipeID", String.valueOf(recipeID));

            // Request a string response from the provided URL.
            JsonObjectRequest jsonRequest = new JsonObjectRequest
                    (Request.Method.DELETE, url, new JSONObject(jsonParams),new Response.Listener<JSONObject>() {
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

        public void getRecipesFromBookmarkList(int userID) {
            // Instantiate the RequestQueue.
            RequestQueue queue = Volley.newRequestQueue(getActivity().getApplicationContext());
            String url = "http://10.0.2.2:8084/getRecipes?userid=" + userID;
            // 10.0.2.2 is a special alias to localhost for developers

            // Request a string response from the provided URL.
            JsonObjectRequest jsonRequest = new JsonObjectRequest
                    (Request.Method.GET, url, null, new Response.Listener<JSONObject>() {
                        @Override
                        public void onResponse(JSONObject response) {
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

        public void filterRecipes(String[] ingredients, String[] filters, String[] restrictions) {
            // Instantiate the RequestQueue.
            RequestQueue queue = Volley.newRequestQueue(getActivity().getApplicationContext());
            String ingredientsList = encodeString(convertArrayToString(ingredients));
            String filtersList = encodeString(convertArrayToString(filters));
            String restrictionsList = encodeString(convertArrayToString(restrictions));

            String url = "http://10.0.2.2:8084/requestFilteredRecipes?ingredients=" + ingredientsList + "&restrictions=" + restrictionsList + "&filters=" + filtersList;
            // 10.0.2.2 is a special alias to localhost for developers

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

        public void getSuggestedRecipes(String[] ingredients, String[] restrictions) {
            // Instantiate the RequestQueue.
            RequestQueue queue = Volley.newRequestQueue(getActivity().getApplicationContext());
            String ingredientsList = encodeString(convertArrayToString(ingredients));
            String restrictionsList = encodeString(convertArrayToString(restrictions));

            String url = "http://10.0.2.2:8084/generateSuggestedRecipesList?ingredientsinpantry=" + ingredientsList + "&restrictions=" + restrictionsList;
            // 10.0.2.2 is a special alias to localhost for developers

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

        public void searchRecipe(String recipeName) {// Instantiate the RequestQueue.
            RequestQueue queue = Volley.newRequestQueue(getActivity().getApplicationContext());
            String url = "http://10.0.2.2:8084/searchRecipe?recipename=" + recipeName;
            // 10.0.2.2 is a special alias to localhost for developers

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

        public void getFullRecipeDetails(int recipeID) {
            // Instantiate the RequestQueue.
            RequestQueue queue = Volley.newRequestQueue(getActivity().getApplicationContext());
            String url = "http://10.0.2.2:8084/getRecipeDetails?recipeid=" + recipeID;
            // 10.0.2.2 is a special alias to localhost for developers

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
    }
}