package com.example.recipez;

import android.app.Dialog;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;

import androidx.activity.OnBackPressedCallback;
import androidx.annotation.NonNull;
import androidx.appcompat.widget.SearchView;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.ImageButton;
import android.widget.TextView;
import android.widget.Toast;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonArrayRequest;
import com.android.volley.toolbox.Volley;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.net.URLEncoder;
import java.util.ArrayList;

public class RecipesFragment extends Fragment {
    final static String TAG = "RecipesFragment";

    private RecyclerView recipeListRecyclerView;
    private TextView currentResultsTitle;
    RecipeCardListRecycleAdapter recycleAdapter;
    ArrayList<JSONObject> recipes;

    private CheckBox dairyFreeCheckBox;
    private CheckBox glutenFreeCheckBox;
    private CheckBox vegetarianCheckBox;
    private CheckBox veganCheckBox;
    private Button filterSearchButton;
    private RecyclerView filterIngredientRecyclerView;
    private FilterIngredientListAdapter filterAdapter;

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
    public static RecipesFragment newInstance(String param1, String param2) {
        RecipesFragment fragment = new RecipesFragment();
        return fragment;
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // This callback will only be called when MyFragment is at least Started.
        OnBackPressedCallback callback = new OnBackPressedCallback(true /* enabled by default */) {
            @Override
            public void handleOnBackPressed() {
                // Handle the back button event
                Intent a = new Intent(Intent.ACTION_MAIN);
                a.addCategory(Intent.CATEGORY_HOME);
                a.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                startActivity(a);}
        };
        requireActivity().getOnBackPressedDispatcher().addCallback(this, callback);

        // The callback can be enabled or disabled here or in handleOnBackPressed()
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        // Inflate the layout for this fragment
        return inflater.inflate(R.layout.fragment_recipes, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        sharedpreferences = getActivity().getSharedPreferences("UserData", Context.MODE_PRIVATE);
        userID = sharedpreferences.getInt("userID", 0);

        recipeListRecyclerView = view.findViewById(R.id.recipe_fragment_recycler_view);
        getSuggestedRecipes(userID);

        currentResultsTitle = view.findViewById(R.id.recipe_list_based_on_your_pantry_text);

        ImageButton filterButton = view.findViewById(R.id.recipe_fragment_filter_button);
        filterButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Dialog dialog = new Dialog(getActivity());
                dialog.setContentView(R.layout.dialog_filter_search_recipes);

                requestIngredients(userID, dialog);
                filterIngredientRecyclerView = dialog.findViewById(R.id.dialog_filter_ingredients_recycler_view);
                filterIngredientRecyclerView.setHasFixedSize(true);
                filterIngredientRecyclerView.setLayoutManager(new LinearLayoutManager(getActivity()));
//                filterAdapter = new FilterIngredientListAdapter(getActivity(), new ArrayList<>(), filterListener);
//                filterIngredientRecyclerView.setAdapter(filterAdapter);

                dairyFreeCheckBox = dialog.findViewById(R.id.dialog_filter_dairy_free_checkbox);
                glutenFreeCheckBox = dialog.findViewById(R.id.dialog_filter_gluten_free_checkbox);
                vegetarianCheckBox = dialog.findViewById(R.id.dialog_filter_vegetarian_checkbox);
                veganCheckBox = dialog.findViewById(R.id.dialog_filter_vegan_checkbox);

                filterSearchButton = dialog.findViewById(R.id.add_to_bookmark_confirm_button);

                dialog.show();
            }
        });

        SearchView recipeSearchBar = view.findViewById(R.id.recipe_list_search_bar);
        recipeSearchBar.setOnQueryTextListener(new SearchView.OnQueryTextListener() {
            @Override
            public boolean onQueryTextSubmit(String query) {
                currentResultsTitle.setText("Search results for '" + query + "'");

                if (recipeListRecyclerView != null) {
                    searchRecipe(query);
                }
                return false;
            }

            @Override
            public boolean onQueryTextChange(String newText) {
                return false;
            }
        });
    }

    private String encodeString(String s) {
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

    private String convertArrayToString(String[] s) {
        String result = "";

        for (int i = 0; i < s.length; i++) {
            if (i == s.length - 1) {
                result += s[i];
            } else {
                result += s[i] + ",";
            }
        }
        return result;
    }

    private void requestIngredients(int userID, Dialog dialog) {
        RequestQueue queue = Volley.newRequestQueue(getActivity().getApplicationContext());
        String url = "http://20.70.170.6:8082/requestIngredients?userid=" + userID + "&googlesignintoken=" + sharedpreferences.getString("googleSignInToken", "");

        JsonArrayRequest jsonRequest = new JsonArrayRequest(Request.Method.GET, url, null, new Response.Listener<JSONArray>() {
            @Override
            public void onResponse(JSONArray response) {
                Log.d(TAG, "fridge request ingredients");
                Log.d(TAG, response.toString());
                Log.d(TAG, "parse to array list");
                try {
                    ArrayList<String> ingredientsList = new ArrayList<>();
                    for (int i = 0; i < response.length(); i++) {
                        JSONObject ingredientObject = response.getJSONObject(i);
                        ingredientsList.add(ingredientObject.getString("name"));
                    }
                    filterAdapter = new FilterIngredientListAdapter(getActivity(), ingredientsList);
                    filterIngredientRecyclerView.setAdapter(filterAdapter);

                    filterSearchButton.setOnClickListener(new View.OnClickListener() {
                        @Override
                        public void onClick(View view) {
                            currentResultsTitle.setText("Search results by custom filters");

                            ArrayList<String> filterArrayList = new ArrayList<>();
                            if (dairyFreeCheckBox.isChecked()) filterArrayList.add("dairyFree");
                            if (glutenFreeCheckBox.isChecked()) filterArrayList.add("glutenFree");
                            if (vegetarianCheckBox.isChecked()) filterArrayList.add("vegetarian");
                            if (veganCheckBox.isChecked()) filterArrayList.add("vegan");
                            String[] filterArray = new String[filterArrayList.size()];
                            filterArray = filterArrayList.toArray(filterArray);

                            ArrayList<String> ingredientsArrayList = filterAdapter.getSelectedIngredients();
                            String[] ingredientsArray = new String[ingredientsArrayList.size()];
                            ingredientsArray = ingredientsArrayList.toArray(ingredientsArray);

                            filterRecipes(ingredientsArray, filterArray, userID);

                            dialog.dismiss();
                        }
                    });

                } catch (JSONException e) {
                    e.printStackTrace();
                }

            }
        }, new Response.ErrorListener() {
            @Override
            public void onErrorResponse(VolleyError error) {
                Log.d(TAG, error.toString());
            }
        });
        queue.add(jsonRequest);
    }

    private void searchRecipe(String recipeName) {// Instantiate the RequestQueue.
        RequestQueue queue = Volley.newRequestQueue(getActivity().getApplicationContext());
        String url = "http://20.70.170.6:8082/searchRecipe?recipename=" + recipeName + "&googlesignintoken=" + sharedpreferences.getString("googleSignInToken", "");

        EspressoIdlingResourceUtil.increment();

        // Request a string response from the provided URL.
        JsonArrayRequest jsonRequest = new JsonArrayRequest
                (Request.Method.GET, url, null, new Response.Listener<JSONArray>() {
                    @Override
                    public void onResponse(JSONArray response) {
                        try {
                            JSONArray recipesArray = response;
                            recipes = new ArrayList<>();
                            for (int i = 0; i < recipesArray.length(); i++) {
                                JSONObject recipeObject = recipesArray.getJSONObject(i);
                                recipes.add(recipeObject);
                            }
                            if (recipes.size() == 0) {
                                Toast.makeText(getActivity(), "No recipes found!", Toast.LENGTH_SHORT).show();
                            }

                            recycleAdapter = new RecipeCardListRecycleAdapter(recipes);
                            RecyclerView.LayoutManager layoutManager = new GridLayoutManager(getActivity(), 2);
                            recipeListRecyclerView.setLayoutManager(layoutManager);
                            recipeListRecyclerView.setAdapter(recycleAdapter);

                            EspressoIdlingResourceUtil.decrement();
                        } catch (JSONException e) {
                            Log.d(TAG, e.toString());
                            e.printStackTrace();
                        }
                        Log.d(TAG, "search recipe " + response.toString());

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

    private void getSuggestedRecipes(int userId) {
        // Instantiate the RequestQueue.
        RequestQueue queue = Volley.newRequestQueue(getActivity().getApplicationContext());

        String url = "http://20.70.170.6:8082/generateSuggestedRecipesList?userid=" + userId + "&googlesignintoken=" + sharedpreferences.getString("googleSignInToken", "");

        // Request a string response from the provided URL.
        JsonArrayRequest jsonRequest = new JsonArrayRequest
                (Request.Method.GET, url, null, new Response.Listener<JSONArray>() {
                    @Override
                    public void onResponse(JSONArray response) {
                        int spanCount = 2;
                        recipes = new ArrayList<>();

                        if (response.length() == 0) {
                            JSONObject placeholder = new JSONObject();
                            try {
                                placeholder.put("image", "https://i.imgur.com/4mHTulR.png");
                                placeholder.put("title", "Try adding ingredients to your pantry to get suggested recipes!");
                            } catch (JSONException e) {
                                e.printStackTrace();
                            }
                            recipes.add(placeholder);
                            spanCount = 1;
                        } else {
                            try {
                                JSONArray recipesArray = response;
                                for (int i = 0; i < recipesArray.length(); i++) {
                                    JSONObject recipeObject = recipesArray.getJSONObject(i);
                                    recipes.add(recipeObject);
                                }

                            } catch (JSONException e) {
                                Log.d(TAG, e.toString());
                                e.printStackTrace();
                            }
                        }
                        recycleAdapter = new RecipeCardListRecycleAdapter(recipes);
                        RecyclerView.LayoutManager layoutManager = new GridLayoutManager(getActivity(), spanCount);
                        recipeListRecyclerView.setLayoutManager(layoutManager);
                        recipeListRecyclerView.setAdapter(recycleAdapter);
                        Log.d(TAG, "suggested recipes " + response.toString());
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

    private void filterRecipes(String[] ingredients, String[] filters, int userid) {
        // Instantiate the RequestQueue.
        RequestQueue queue = Volley.newRequestQueue(getActivity().getApplicationContext());
        String ingredientsList = encodeString(convertArrayToString(ingredients));
        String filtersList = encodeString(convertArrayToString(filters));

        Log.d(TAG, "ingredientsList " + ingredientsList);
        Log.d(TAG, "filtersList " + filtersList);

        String url = "http://20.70.170.6:8082/requestFilteredRecipes?ingredients=" + ingredientsList + "&filters=" + filtersList + "&userid=" + userid + "&googlesignintoken=" + sharedpreferences.getString("googleSignInToken", "");

        EspressoIdlingResourceUtil.increment();

        // Request a string response from the provided URL.
        JsonArrayRequest jsonRequest = new JsonArrayRequest
                (Request.Method.GET, url, null, new Response.Listener<JSONArray>() {
                    @Override
                    public void onResponse(JSONArray response) {
                        try {
                            JSONArray recipesArray = response;
                            recipes = new ArrayList<>();
                            for (int i = 0; i < recipesArray.length(); i++) {
                                JSONObject recipeObject = recipesArray.getJSONObject(i);
                                recipes.add(recipeObject);
                            }
                            if (recipes.size() == 0) {
                                Toast.makeText(getActivity(), "No recipes found!", Toast.LENGTH_SHORT).show();
                            }

                            recycleAdapter = new RecipeCardListRecycleAdapter(recipes);
                            RecyclerView.LayoutManager layoutManager = new GridLayoutManager(getActivity(), 2);
                            recipeListRecyclerView.setLayoutManager(layoutManager);
                            recipeListRecyclerView.setAdapter(recycleAdapter);

                            EspressoIdlingResourceUtil.decrement();
                        } catch (JSONException e) {
                            Log.d(TAG, e.toString());
                            e.printStackTrace();
                        }
                        Log.d(TAG, "filter recipe " + response.toString());
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