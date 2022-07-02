package com.example.recipez;

import android.os.Bundle;

import androidx.annotation.NonNull;
import androidx.appcompat.widget.SearchView;
import androidx.fragment.app.Fragment;

import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageButton;
import android.widget.ListView;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;

public class BookmarkListFragment extends Fragment {
    final static String TAG = "BookmarkListFragment";

    // TODO: Rename parameter arguments, choose names that match
    // the fragment initialization parameters, e.g. ARG_ITEM_NUMBER
    private static final String ARG_PARAM1 = "param1";
    private static final String ARG_PARAM2 = "param2";

    // TODO: Rename and change types of parameters
    private String mParam1;
    private String mParam2;

    private ImageButton backButton;
    private SearchView searchBar;
    private ListView bookmarkedRecipesListView;

    public BookmarkListFragment() {
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
    public static BookmarkListFragment newInstance(String param1, String param2) {
        BookmarkListFragment fragment = new BookmarkListFragment();
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
        return inflater.inflate(R.layout.fragment_bookmark_list, container, false);
    }

    String dummyList = "[\n" +
            "    {\n" +
            "        \"title\": \"What to make for dinner tonight?? Bruschetta Style Pork & Pasta\",\n" +
            "        \"image\": \"https://spoonacular.com/recipeImages/715538-312x231.jpg\"\n" +
            "    },\n" +
            "    {\n" +
            "        \"title\": \"Toasted\\\" Agnolotti (or Ravioli)\",\n" +
            "        \"image\": \"https://spoonacular.com/recipeImages/631807-312x231.jpg\"\n" +
            "    },\n" +
            "    {\n" +
            "        \"title\": \"Penne with Goat Cheese and Basil\",\n" +
            "        \"image\": \"https://spoonacular.com/recipeImages/655589-312x231.jpg\"\n" +
            "    },\n" +
            "    {\n" +
            "        \"title\": \"4th of July RASPBERRY, WHITE & BLUEBERRY FARM TO TABLE Cocktail From Harvest Spirits\",\n" +
            "        \"image\": \"https://spoonacular.com/recipeImages/631870-312x231.jpg\"\n" +
            "    },\n" +
            "    {\n" +
            "        \"title\": \"Hot Garlic and Oil Pasta\",\n" +
            "        \"image\": \"https://spoonacular.com/recipeImages/647465-312x231.jpg\"\n" +
            "    },\n" +
            "    {\n" +
            "        \"title\": \"Simple Garlic Pasta\",\n" +
            "        \"image\": \"https://spoonacular.com/recipeImages/660101-312x231.jpg\"\n" +
            "    },\n" +
            "    {\n" +
            "        \"title\": \"Linguine With Chick Peas and Bacon\",\n" +
            "        \"image\": \"https://spoonacular.com/recipeImages/650132-312x231.jpg\"\n" +
            "    },\n" +
            "    {\n" +
            "        \"title\": \"Pasta Con Pepe E Caciotta Al Tartufo\",\n" +
            "        \"image\": \"https://spoonacular.com/recipeImages/654830-312x231.jpg\"\n" +
            "    },\n" +
            "    {\n" +
            "        \"title\": \"Baked Ziti\",\n" +
            "        \"image\": \"https://spoonacular.com/recipeImages/633876-312x231.jpg\"\n" +
            "    },\n" +
            "    {\n" +
            "        \"title\": \"Bird's Nest Marinara\",\n" +
            "        \"image\": \"https://spoonacular.com/recipeImages/634995-312x231.jpg\"\n" +
            "    }\n" +
            "]";
    //String[] dummyList = {"pizza", "sushi", "apple", "pancake", "egg", "feta cheese"};
    JSONArrayAdapter arrayAdapter;

    @Override
    public void onViewCreated(@NonNull View view, Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        backButton = view.findViewById(R.id.back_button);
        backButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Fragment fragment = new ProfileFragment();
                getParentFragmentManager().beginTransaction().replace(R.id.frame, fragment).commit();
            }
        });

        try {
            bookmarkedRecipesListView = view.findViewById(R.id.bookmarked_recipes_listview);
            JSONArray recipesArray = new JSONArray(dummyList);
            ArrayList<JSONObject> recipes = new ArrayList<>();
            for (int i = 0; i < recipesArray.length(); i++) {
                JSONObject recipeObject = recipesArray.getJSONObject(i);
                // Recipe recipe = new Recipe(recipeObject.getString("title"), recipeObject.getString("image"));
                recipes.add(recipeObject);
            }

            arrayAdapter = new JSONArrayAdapter(getActivity(), R.layout.list_row_recipe, recipes, "recipe");
            if (bookmarkedRecipesListView != null) {
                bookmarkedRecipesListView.setAdapter(arrayAdapter);
            }

        } catch (JSONException e) {
            Log.d(TAG, e.toString());
            e.printStackTrace();
        }

//        bookmarkedRecipesListView.setOnItemClickListener(new AdapterView.OnItemClickListener() {
//            @Override
//            public void onItemClick(AdapterView<?> adapterView, View view, int i, long l) {
//                Toast.makeText(getActivity(), adapterView.getItemAtPosition(i), Toast.LENGTH_SHORT).show();
//            }
//        });

        searchBar = view.findViewById(R.id.bookmark_list_search_bar);
        searchBar.setOnQueryTextListener(new SearchView.OnQueryTextListener() {
            @Override
            public boolean onQueryTextSubmit(String query) {
                arrayAdapter.getFilter().filter(query);
                if (bookmarkedRecipesListView != null) {
                    bookmarkedRecipesListView.setAdapter(arrayAdapter);
                }
                return false;
            }

            @Override
            public boolean onQueryTextChange(String newText) {
                arrayAdapter.getFilter().filter(newText);
                if (bookmarkedRecipesListView != null) {
                    bookmarkedRecipesListView.setAdapter(arrayAdapter);
                }
                return false;
            }
        });
    }
}
