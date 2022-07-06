package com.example.recipez;

import android.os.Bundle;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ListView;

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

/**
 * A simple {@link Fragment} subclass.
 * Use the {@link FridgeFragment#newInstance} factory method to
 * create an instance of this fragment.
 */
public class FridgeFragment extends Fragment {
    final static String TAG = "FridgeFragment";

    private ArrayList<JSONObject> ingredients;
    private RecyclerView mRecyclerView;
    private FridgeAdapter mAdapter;
    private RecyclerView.LayoutManager mLayoutManager;

    public final class Ingredient extends MainActivity {
        private int myStaticMember;
        private String TAG = "Ingredient Class";

        public Ingredient() {
            myStaticMember = 1;
        }

        public void requestIngredients(String userID, View view) {
            RequestQueue queue = Volley.newRequestQueue(getActivity().getApplicationContext());
            String url = "http://10.0.2.2:8083/requestIngredients?userid=" + userID;

            JsonArrayRequest jsonRequest = new JsonArrayRequest(Request.Method.GET, url, null, new Response.Listener<JSONArray>() {
                @Override
                public void onResponse(JSONArray response) {
                    Log.d(TAG, "got here");

                    Log.d(TAG, response.toString());
                    try {
                        ingredients = new ArrayList<>();
                        for (int i = 0; i < response.length(); i++) {
                            JSONObject ingredientObject = response.getJSONObject(i);
                            ingredients.add(ingredientObject);
                        }
                    } catch (JSONException e) {
                        Log.d(TAG, e.toString());
                        e.printStackTrace();
                    }

                    buildRecyclerView(view);
                }}, new Response.ErrorListener() {
                @Override
                public void onErrorResponse(VolleyError error) {
                    Log.d(TAG, error.toString());
                }
            });
            queue.add(jsonRequest);
        }
    }

    String dummyList = "[\n" +
            "    {\n" +
            "        \"name\": \"Apple\",\n" +
            "        \"image\": \"https://spoonacular.com/recipeImages/715538-312x231.jpg\",\n" +
            "        \"expiry\": \"123456\"\n" +
            "    },\n" +
            "    {\n" +
            "        \"name\": \"Toasted\\\" Agnolotti (or Ravioli)\",\n" +
            "        \"image\": \"https://spoonacular.com/recipeImages/631807-312x231.jpg\",\n" +
            "        \"expiry\": \"123456\"\n" +
            "    },\n" +
            "    {\n" +
            "        \"name\": \"Penne with Goat Cheese and Basil\",\n" +
            "        \"image\": \"https://spoonacular.com/recipeImages/655589-312x231.jpg\",\n" +
            "        \"expiry\": \"123456\"\n" +
            "    }\n" +
            "]";

    public FridgeFragment() {
        // Required empty public constructor
    }

    /**
     * Use this factory method to create a new instance of
     * this fragment using the provided parameters.
     *
     * @param param1 Parameter 1.
     * @param param2 Parameter 2.
     * @return A new instance of fragment FridgeFragment.
     */
    // TODO: Rename and change types and number of parameters
    public static FridgeFragment newInstance(String param1, String param2) {
        FridgeFragment fragment = new FridgeFragment();
        Bundle args = new Bundle();
        fragment.setArguments(args);
        return fragment;
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }

    public void buildRecyclerView(View view) {
        mRecyclerView = view.findViewById(R.id.fridgeRecyclerView);
        mRecyclerView.setHasFixedSize(true);
        mLayoutManager = new LinearLayoutManager(getActivity());
        mAdapter = new FridgeAdapter(ingredients);

        mRecyclerView.setLayoutManager(mLayoutManager);
        mRecyclerView.setAdapter(mAdapter);

        mAdapter.setOnItemClickListener(new FridgeAdapter.OnItemClickListener() {
            @Override
            public void onDeleteClick(int position) {
                removeItem(position);
            }
        });
    }

    public void insertItem(int position, JSONObject insert) {
        ingredients.add(position, insert);    // TODO: format maybe? how to decide the position?
        mAdapter.notifyItemInserted(position);
    }

    public void removeItem(int position) {
        ingredients.remove(position);
        mAdapter.notifyItemRemoved(position);
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        // Inflate the layout for this fragment
        return inflater.inflate(R.layout.fragment_fridge, container, false);

        // Maybe make API call here to get JSONArray

    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        Ingredient ingredient = new Ingredient();
        ingredient.requestIngredients("11111", view);
    }
}