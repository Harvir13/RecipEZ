package com.example.recipez;

import android.app.Dialog;
import android.content.Context;
import android.content.SharedPreferences;
import android.os.Bundle;

import androidx.activity.OnBackPressedCallback;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
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
import android.widget.ListView;
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
import java.util.Map;

/**
 * A simple {@link Fragment} subclass.
 * Use the {@link AllergiesListFragment#newInstance} factory method to
 * create an instance of this fragment.
 */
public class AllergiesListFragment extends Fragment {
    final static String TAG = "FridgeFragment";

    private ArrayList<String> allergiesList;
    private AllergiesListAdapter mAdapter;
    SharedPreferences sharedpreferences;
    private int userID; // todo: test if works

    public final class IngredientFetching extends MainActivity {
        private int myStaticMember;
        private String TAG = "Ingredient Class";

        public IngredientFetching() {
            myStaticMember = 1;
        }

        private void requestAllergiesList(String userID, View view) {
            RequestQueue queue = Volley.newRequestQueue(getActivity().getApplicationContext());
            String url = "http://20.53.224.7:8082/getRestrictions?userid=" + userID + "&googlesignintoken=" + sharedpreferences.getString("googleSignInToken", "");

            JsonObjectRequest jsonRequest = new JsonObjectRequest(Request.Method.GET, url, null, new Response.Listener<JSONObject>() {
                @Override
                public void onResponse(JSONObject response) {
                    Log.d(TAG, "requested: " + response.toString());
                    try {
                        allergiesList = new ArrayList<>();
                        JSONArray restrictions = (JSONArray) response.get("dietaryRestrictions");
                        for (int i = 0; i < restrictions.length(); i++) {
                            Log.d(TAG, restrictions.get(i).toString());
                            allergiesList.add(restrictions.get(i).toString());
                        }
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

        private void deleteAllergy(String userID, String ingredient) {
            RequestQueue queue = Volley.newRequestQueue(getActivity().getApplicationContext());
            String url = "http://20.53.224.7:8082/deleteRestrictions";

            Map<String, String> jsonParams = new HashMap();
            jsonParams.put("userID", userID);
            jsonParams.put("restriction", ingredient);
            jsonParams.put("googleSignInToken", sharedpreferences.getString("googleSignInToken", ""));

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

        private void addAllergy(String userID, String ingredient) {
            RequestQueue queue = Volley.newRequestQueue(getActivity().getApplicationContext());
            String url = "http://20.53.224.7:8082/addRestrictions";

            Map<String, String> jsonParams = new HashMap();
            try {
                jsonParams.put("userID", userID);
                jsonParams.put("restriction", ingredient);
                jsonParams.put("googleSignInToken", sharedpreferences.getString("googleSignInToken", ""));
            } catch (Exception e) {
                e.printStackTrace();
            }

            JsonObjectRequest jsonRequest = new JsonObjectRequest
                    (Request.Method.PUT, url, new JSONObject(jsonParams), new Response.Listener<JSONObject>() {
                        @Override
                        public void onResponse(JSONObject response) {
                            Log.d(TAG, response.toString());
                        }
                    }, new Response.ErrorListener() {
                        @Override
                        public void onErrorResponse(VolleyError error) {
                            Log.d(TAG, error.toString() + "STORE");
                        }
                    });
            queue.add(jsonRequest);
        }

        private void getIngredientSuggestions(String string) {
            RequestQueue queue = Volley.newRequestQueue(getActivity().getApplicationContext());
            String url = "http://20.53.224.7:8086/getIngredientSuggestions?string=" + string + "&googlesignintoken=" + sharedpreferences.getString("googleSignInToken", "");
            JsonArrayRequest jsonArrayRequest = new JsonArrayRequest
                    (Request.Method.GET, url, null, new Response.Listener<JSONArray>() {
                        @Override
                        public void onResponse(JSONArray response) {
                            try {
                                ArrayList<String> ingredientSuggestions = new ArrayList<>();
                                for (int i = 0; i < response.length(); i++) {
                                    ingredientSuggestions.add(response.getJSONObject(i).getString("name"));
                                }
                                if (ingredientSuggestions.size() == 0) {
                                    Toast.makeText(getActivity().getApplicationContext(), "No ingredients found, please try a different search", Toast.LENGTH_LONG).show();
                                    openAddAllergyDialog();
                                }
                                else {
                                    openSelectIngredientDialog(ingredientSuggestions);
                                }
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
            queue.add(jsonArrayRequest);
        }
    }

    /**
     * Use this factory method to create a new instance of
     * this fragment using the provided parameters.
     *
     * @param param1 Parameter 1.
     * @param param2 Parameter 2.
     * @return A new instance of fragment AllergiesListFragment.
     */
    public static AllergiesListFragment newInstance(String param1, String param2) {
        AllergiesListFragment fragment = new AllergiesListFragment();
        Bundle args = new Bundle();
        fragment.setArguments(args);
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
                Fragment fragment = new ProfileFragment();
                getParentFragmentManager().beginTransaction().replace(R.id.frame, fragment).commit();
            }
        };
        requireActivity().getOnBackPressedDispatcher().addCallback(this, callback);

        // The callback can be enabled or disabled here or in handleOnBackPressed()
    }

    public void buildRecyclerView(View view) {
        RecyclerView mRecyclerView = view.findViewById(R.id.allergyRecyclerView);
        mRecyclerView.setHasFixedSize(true);
        RecyclerView.LayoutManager mLayoutManager = new LinearLayoutManager(getActivity());
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

    private void removeItem(int position) {
        IngredientFetching ingredient = new IngredientFetching();
        ingredient.deleteAllergy(String.valueOf(userID), allergiesList.get(position));
        allergiesList.remove(position);
        mAdapter.notifyItemRemoved(position);
    }

    private void addItem(String restriction) {
        IngredientFetching ingredient = new IngredientFetching();
        ingredient.addAllergy(String.valueOf(userID), restriction);
        allergiesList.add(allergiesList.size(), restriction);
        mAdapter.notifyDataSetChanged();
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

        sharedpreferences = getActivity().getSharedPreferences("UserData", Context.MODE_PRIVATE);
        userID = sharedpreferences.getInt("userID", 0);

        ImageButton addAllergyButton = view.findViewById(R.id.addAllergyButton);
        addAllergyButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                openAddAllergyDialog();
            }
        });

        IngredientFetching ingredient = new IngredientFetching();
        ingredient.requestAllergiesList(String.valueOf(userID), view);
    }

    private void openAddAllergyDialog() {
        Dialog dialog = new Dialog(getActivity());
        dialog.setContentView(R.layout.dialog_add_ingredient);

        EditText editIngredientName = dialog.findViewById(R.id.editIngredientName);

        Button addIngredientConfirm = dialog.findViewById(R.id.addIngredientConfirm);
        addIngredientConfirm.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                String name = editIngredientName.getText().toString();
                IngredientFetching ingredient = new IngredientFetching();
                ingredient.getIngredientSuggestions(name);
                dialog.dismiss();
            }
        });

        dialog.show();
    }

    private void openSelectIngredientDialog(ArrayList<String> selectIngredients) {
        Dialog dialog = new Dialog(getActivity());
        dialog.setContentView(R.layout.dialog_select_ingredient);

        ListView selectIngredientList = dialog.findViewById(R.id.selectIngredientList);
        ArrayAdapter<String> adapter = new ArrayAdapter<String>(getActivity().getApplicationContext(), R.layout.list_row_select_ingredient, selectIngredients);
        selectIngredientList.setAdapter(adapter);

        selectIngredientList.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                addItem(selectIngredients.get(position));
                dialog.dismiss();
            }
        });

        dialog.show();
    }
}