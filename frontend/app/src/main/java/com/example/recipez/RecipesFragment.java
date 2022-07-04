package com.example.recipez;

import android.os.Bundle;

import androidx.annotation.NonNull;
import androidx.cardview.widget.CardView;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;

public class RecipesFragment extends Fragment {
    final static String TAG = "RecipesFragment";

    // TODO: Rename parameter arguments, choose names that match
    // the fragment initialization parameters, e.g. ARG_ITEM_NUMBER
    private static final String ARG_PARAM1 = "param1";
    private static final String ARG_PARAM2 = "param2";

    // TODO: Rename and change types of parameters
    private String mParam1;
    private String mParam2;

    private RecyclerView recipeListRecyclerView;
    private CardView recipeCardButton;

    public RecipesFragment() {
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
    public static RecipesFragment newInstance(String param1, String param2) {
        RecipesFragment fragment = new RecipesFragment();
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
        return inflater.inflate(R.layout.fragment_recipes, container, false);
    }

    String dummyList = "[\n" +
            "    {\n" +
            "        \"id\": 715538,\n" +
            "        \"title\": \"What to make for dinner tonight?? Bruschetta Style Pork & Pasta\",\n" +
            "        \"image\": \"https://spoonacular.com/recipeImages/715538-312x231.jpg\"\n" +
            "    },\n" +
            "    {\n" +
            "        \"id\": 631807,\n" +
            "        \"title\": \"Toasted\\\" Agnolotti (or Ravioli)\",\n" +
            "        \"image\": \"https://spoonacular.com/recipeImages/631807-312x231.jpg\"\n" +
            "    },\n" +
            "    {\n" +
            "        \"id\": 655589,\n" +
            "        \"title\": \"Penne with Goat Cheese and Basil\",\n" +
            "        \"image\": \"https://spoonacular.com/recipeImages/655589-312x231.jpg\"\n" +
            "    },\n" +
            "    {\n" +
            "        \"id\": 631870,\n" +
            "        \"title\": \"4th of July RASPBERRY, WHITE & BLUEBERRY FARM TO TABLE Cocktail From Harvest Spirits\",\n" +
            "        \"image\": \"https://spoonacular.com/recipeImages/631870-312x231.jpg\"\n" +
            "    },\n" +
            "    {\n" +
            "        \"id\": 647465,\n" +
            "        \"title\": \"Hot Garlic and Oil Pasta\",\n" +
            "        \"image\": \"https://spoonacular.com/recipeImages/647465-312x231.jpg\"\n" +
            "    },\n" +
            "    {\n" +
            "        \"id\": 660101,\n" +
            "        \"title\": \"Simple Garlic Pasta\",\n" +
            "        \"image\": \"https://spoonacular.com/recipeImages/660101-312x231.jpg\"\n" +
            "    },\n" +
            "    {\n" +
            "        \"id\": 650132,\n" +
            "        \"title\": \"Linguine With Chick Peas and Bacon\",\n" +
            "        \"image\": \"https://spoonacular.com/recipeImages/650132-312x231.jpg\"\n" +
            "    },\n" +
            "    {\n" +
            "        \"id\": 654830,\n" +
            "        \"title\": \"Pasta Con Pepe E Caciotta Al Tartufo\",\n" +
            "        \"image\": \"https://spoonacular.com/recipeImages/654830-312x231.jpg\"\n" +
            "    },\n" +
            "    {\n" +
            "        \"id\": 633876,\n" +
            "        \"title\": \"Baked Ziti\",\n" +
            "        \"image\": \"https://spoonacular.com/recipeImages/633876-312x231.jpg\"\n" +
            "    },\n" +
            "    {\n" +
            "        \"id\": 634995,\n" +
            "        \"title\": \"Bird's Nest Marinara\",\n" +
            "        \"image\": \"https://spoonacular.com/recipeImages/634995-312x231.jpg\"\n" +
            "    }\n" +
            "]";
    RecipeCardListRecycleAdapter recycleAdapter;
    ArrayList<JSONObject> recipes;

    @Override
    public void onViewCreated(@NonNull View view, Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        try {
            recipeListRecyclerView = view.findViewById(R.id.recipe_fragment_recycler_view);
            JSONArray recipesArray = new JSONArray(dummyList);
            recipes = new ArrayList<>();
            for (int i = 0; i < recipesArray.length(); i++) {
                JSONObject recipeObject = recipesArray.getJSONObject(i);
                recipes.add(recipeObject);
            }

            recycleAdapter = new RecipeCardListRecycleAdapter(recipes);
            RecyclerView.LayoutManager layoutManager = new GridLayoutManager(getActivity(), 2);
            recipeListRecyclerView.setLayoutManager(layoutManager);
            recipeListRecyclerView.setAdapter(recycleAdapter);

        } catch (JSONException e) {
            Log.d(TAG, e.toString());
            e.printStackTrace();
        }
    }
}