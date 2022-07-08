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
import android.widget.ImageButton;

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
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

/**
 * A simple {@link Fragment} subclass.
 * Use the {@link AllergiesListFragment#newInstance} factory method to
 * create an instance of this fragment.
 */
public class AllergiesListFragment extends Fragment {
    final static String TAG = "FridgeFragment";

    private ImageButton addAllergyButton;
    private ArrayList<String> allergiesList;
    private RecyclerView mRecyclerView;
    private AllergiesListAdapter mAdapter;
    private RecyclerView.LayoutManager mLayoutManager;

    public final class Ingredient extends MainActivity {
        private int myStaticMember;
        private String TAG = "Ingredient Class";

        public Ingredient() {
            myStaticMember = 1;
        }

        public void requestAllergiesList(String userID, View view) {
            RequestQueue queue = Volley.newRequestQueue(getActivity().getApplicationContext());
            String url = "http://20.53.224.7:8082/getRestrictions?userid=" + userID;

            JsonObjectRequest jsonRequest = new JsonObjectRequest(Request.Method.GET, url, null, new Response.Listener<JSONObject>() {
                @Override
                public void onResponse(JSONObject response) {
                    Log.d(TAG, response.toString());
                    try {
                        allergiesList = new ArrayList(Arrays.asList(response.get("dietaryRestrictions")));
                    } catch (JSONException e) {
                        Log.d(TAG, e.toString());
                        e.printStackTrace();
                    }

                    buildRecyclerView(view);
                }
            }, new Response.ErrorListener() {
                @Override
                public void onErrorResponse(VolleyError error) {
                    Log.d(TAG, error.toString() + "REQUEST");
                }
            });
            queue.add(jsonRequest);
        }

        public void deleteAllergy(String userID, String ingredient) { // or the actual ingredient, just need the name here
            RequestQueue queue = Volley.newRequestQueue(getActivity().getApplicationContext());
            String url = "http://20.53.224.7:8082/deleteRestrictions";

            Map<String, String> jsonParams = new HashMap();
            jsonParams.put("userid", userID);
            jsonParams.put("restriction", ingredient);

            JsonObjectRequest jsonRequest = new JsonObjectRequest
                    (Request.Method.PUT, url, new JSONObject(jsonParams), new Response.Listener<JSONObject>() {
                        @Override
                        public void onResponse(JSONObject response) {
                            Log.d(TAG, response.toString());
                        }
                    }, new Response.ErrorListener() {
                        @Override
                        public void onErrorResponse(VolleyError error) {
                            Log.d(TAG, error.toString() + "DELETE");
                        }
                    });
            queue.add(jsonRequest);
        }

        public void addAllergy(String userID, String ingredient) { // or the actual ingredient, just need the name here
            RequestQueue queue = Volley.newRequestQueue(getActivity().getApplicationContext());
            String url = "http://20.53.224.7:8082/addRestrictions";

            Map<String, String> jsonParams = new HashMap();
            try {
                jsonParams.put("userid", userID);
                jsonParams.put("restriction", ingredient);
            } catch (Exception e) {
                e.printStackTrace();
            }

            JsonObjectRequest jsonRequest = new JsonObjectRequest
                    (Request.Method.PUT, url, new JSONObject(jsonParams), new Response.Listener<JSONObject>() {
                        @Override
                        public void onResponse(JSONObject response) {
                        }
                    }, new Response.ErrorListener() {
                        @Override
                        public void onErrorResponse(VolleyError error) {
                            Log.d(TAG, error.toString() + "STORE");
                        }
                    });
            queue.add(jsonRequest);
        }
    }

        public AllergiesListFragment() {
        // Required empty public constructor
    }

    /**
     * Use this factory method to create a new instance of
     * this fragment using the provided parameters.
     *
     * @param param1 Parameter 1.
     * @param param2 Parameter 2.
     * @return A new instance of fragment AllergiesListFragment.
     */
    // TODO: Rename and change types and number of parameters
    public static AllergiesListFragment newInstance(String param1, String param2) {
        AllergiesListFragment fragment = new AllergiesListFragment();
        Bundle args = new Bundle();
        fragment.setArguments(args);
        return fragment;
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }

    public void buildRecyclerView(View view) {
        mRecyclerView = view.findViewById(R.id.allergyRecyclerView);
        mRecyclerView.setHasFixedSize(true);
        mLayoutManager = new LinearLayoutManager(getActivity());
        mAdapter = new AllergiesListAdapter(allergiesList);

        mRecyclerView.setLayoutManager(mLayoutManager);
        mRecyclerView.setAdapter(mAdapter);

        mAdapter.setOnItemClickListener(new AllergiesListAdapter.OnItemClickListener() {

            @Override
            public void onDeleteClick(int position) {
                removeItem(position);
            }
        });
    }

    public void removeItem(int position) {
        Ingredient ingredient = new Ingredient();
        ingredient.deleteAllergy("11111", allergiesList.get(position)); // TODO
        allergiesList.remove(position);
        mAdapter.notifyItemRemoved(position);
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        // Inflate the layout for this fragment
        return inflater.inflate(R.layout.fragment_allergies_list, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        Ingredient ingredient = new Ingredient();
        ingredient.requestAllergiesList("11111", view); // TODO

//        allergiesList = new ArrayList<String>(Arrays.asList(new String[]{"Peanuts", "Walnuts"}));

        buildRecyclerView(view);
    }
}