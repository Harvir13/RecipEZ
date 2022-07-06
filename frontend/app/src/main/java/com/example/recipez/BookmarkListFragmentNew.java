package com.example.recipez;

import android.app.Dialog;
import android.os.Bundle;

import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

public class BookmarkListFragmentNew extends Fragment {
    final static String TAG = "BookmarkListFragmentNew";

    // TODO: Rename parameter arguments, choose names that match
    // the fragment initialization parameters, e.g. ARG_ITEM_NUMBER
    private static final String ARG_PARAM1 = "param1";
    private static final String ARG_PARAM2 = "param2";

    // TODO: Rename and change types of parameters
    private String mParam1;
    private String mParam2;

    private RecyclerView bookmarkListRecyclerView;
    private Button addNewFolderButton;

    public BookmarkListFragmentNew() {
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
    public static BookmarkListFragmentNew newInstance(String param1, String param2) {
        BookmarkListFragmentNew fragment = new BookmarkListFragmentNew();
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
        return inflater.inflate(R.layout.fragment_bookmark_list_new, container, false);
    }

    String dummyList = "[\n" +
            "    {\n" +
            "        \"id\": 715538,\n" +
            "        \"title\": \"What to make for dinner tonight?? Bruschetta Style Pork & Pasta\",\n" +
            "        \"image\": \"https://spoonacular.com/recipeImages/715538-312x231.jpg\",\n" +
            "        \"path\": \"folder1\"\n" +
            "    },\n" +
            "    {\n" +
            "        \"id\": 631807,\n" +
            "        \"title\": \"Toasted\\\" Agnolotti (or Ravioli)\",\n" +
            "        \"image\": \"https://spoonacular.com/recipeImages/631807-312x231.jpg\",\n" +
            "        \"path\": \"folder1\"\n" +
            "    },\n" +
            "    {\n" +
            "        \"id\": 655589,\n" +
            "        \"title\": \"Penne with Goat Cheese and Basil\",\n" +
            "        \"image\": \"https://spoonacular.com/recipeImages/655589-312x231.jpg\",\n" +
            "        \"path\": \"folder1\"\n" +
            "    },\n" +
            "    {\n" +
            "        \"id\": 631870,\n" +
            "        \"title\": \"4th of July RASPBERRY, WHITE & BLUEBERRY FARM TO TABLE Cocktail From Harvest Spirits\",\n" +
            "        \"image\": \"https://spoonacular.com/recipeImages/631870-312x231.jpg\",\n" +
            "        \"path\": \"folder2\"\n" +
            "    },\n" +
            "    {\n" +
            "        \"id\": 647465,\n" +
            "        \"title\": \"Hot Garlic and Oil Pasta\",\n" +
            "        \"image\": \"https://spoonacular.com/recipeImages/647465-312x231.jpg\",\n" +
            "        \"path\": \"folder2\"\n" +
            "    },\n" +
            "    {\n" +
            "        \"id\": 660101,\n" +
            "        \"title\": \"Simple Garlic Pasta\",\n" +
            "        \"image\": \"https://spoonacular.com/recipeImages/660101-312x231.jpg\",\n" +
            "        \"path\": \"folder2\"\n" +
            "    },\n" +
            "    {\n" +
            "        \"id\": 650132,\n" +
            "        \"title\": \"Linguine With Chick Peas and Bacon\",\n" +
            "        \"image\": \"https://spoonacular.com/recipeImages/650132-312x231.jpg\",\n" +
            "        \"path\": \"folder3\"\n" +
            "    },\n" +
            "    {\n" +
            "        \"id\": 654830,\n" +
            "        \"title\": \"Pasta Con Pepe E Caciotta Al Tartufo\",\n" +
            "        \"image\": \"https://spoonacular.com/recipeImages/654830-312x231.jpg\",\n" +
            "        \"path\": \"folder3\"\n" +
            "    },\n" +
            "    {\n" +
            "        \"id\": 633876,\n" +
            "        \"title\": \"Baked Ziti\",\n" +
            "        \"image\": \"https://spoonacular.com/recipeImages/633876-312x231.jpg\",\n" +
            "        \"path\": \"folder3\"\n" +
            "    },\n" +
            "    {\n" +
            "        \"id\": 634995,\n" +
            "        \"title\": \"Bird's Nest Marinara\",\n" +
            "        \"image\": \"https://spoonacular.com/recipeImages/634995-312x231.jpg\",\n" +
            "        \"path\": \"\"\n" +
            "    }\n" +
            "]";
    private List<BookmarkFolder> folderList;
    private BookmarkFolderAdapter adapter;

    @Override
    public void onViewCreated(@NonNull View view, Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        bookmarkListRecyclerView = view.findViewById(R.id.bookmark_list_recycler_view);
        // bookmarkListRecyclerView.setHasFixedSize(true);
        bookmarkListRecyclerView.setLayoutManager(new LinearLayoutManager(getActivity()));

        addNewFolderButton = view.findViewById(R.id.add_folder_dialog_button);
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
                        } else {
                            Toast.makeText(getActivity(), "Please enter a folder name", Toast.LENGTH_SHORT).show();
                        }

                        List<JSONObject> recipeList = new ArrayList<>();
                        folderList.add(new BookmarkFolder(recipeList, folderName));
                        adapter.notifyItemInserted(folderList.size() - 1);
                        bookmarkListRecyclerView.scrollToPosition(folderList.size() - 1);
                    }
                });

                dialog.show();
            }
        });

        // need a way to make this smart + be able to add/delete folders
        folderList = new ArrayList<>();

        List<JSONObject> folder1Recipes = new ArrayList<>();
        List<JSONObject> folder2Recipes = new ArrayList<>();
        List<JSONObject> folder3Recipes = new ArrayList<>();
        List<JSONObject> uncategorizedRecipes = new ArrayList<>();

        try {
            JSONArray recipesArray = new JSONArray(dummyList);
            for (int i = 0; i < recipesArray.length(); i++) {
                JSONObject recipeObject = recipesArray.getJSONObject(i);
                String recipeFolderPath = recipeObject.getString("path");

                if (recipeFolderPath.equals("folder1")) {
                    folder1Recipes.add(recipeObject);
                } else if (recipeFolderPath.equals("folder2")) {
                    folder2Recipes.add(recipeObject);
                } else if (recipeFolderPath.equals("folder3")) {
                    folder3Recipes.add(recipeObject);
                } else if (recipeFolderPath.equals("")) {
                    uncategorizedRecipes.add(recipeObject);
                }
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }

        BookmarkFolder folder1 = new BookmarkFolder(folder1Recipes, "folder1");
        BookmarkFolder folder2 = new BookmarkFolder(folder2Recipes, "folder2");
        BookmarkFolder folder3 = new BookmarkFolder(folder3Recipes, "folder3");
        BookmarkFolder folderUncategorized = new BookmarkFolder(uncategorizedRecipes, "uncategorized");

        folderList.add(folder1);
        folderList.add(folder2);
        folderList.add(folder3);
        folderList.add(folderUncategorized);

        adapter = new BookmarkFolderAdapter(folderList);
        bookmarkListRecyclerView.setAdapter(adapter);
    }
}

