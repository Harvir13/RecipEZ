package com.example.recipez;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.Filter;
import android.widget.Filterable;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.squareup.picasso.Picasso;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;

public class JSONArrayAdapter extends ArrayAdapter<JSONObject> implements Filterable {
    final static String TAG = "JSONArrayAdapter";

    private Context mContext;
    private int mResource;
    private ArrayList<JSONObject> allObjects;
    private String objectType;

    public JSONArrayAdapter(@NonNull Context context, int resource, @NonNull ArrayList<JSONObject> objects, String objectType) {
        super(context, resource, objects);
        mContext = context;
        mResource = resource;
        allObjects = new ArrayList<>(objects);
        objectType = objectType;
    }

    @NonNull
    @Override
    public View getView(int position, @Nullable View convertView, @NonNull ViewGroup parent) {
        LayoutInflater layoutInflator = LayoutInflater.from(mContext);
        convertView = layoutInflator.inflate(mResource, parent, false);

        ImageView imageView = convertView.findViewById(R.id.recipe_row_image);
        TextView textView = convertView.findViewById(R.id.recipe_row_title);

        try {
            Picasso.get().load(getItem(position).getString("image")).resize(60, 60).centerCrop().into(imageView);
            textView.setText(getItem(position).getString("title"));
        } catch (JSONException e) {
            e.printStackTrace();
        }

        return convertView;
    }

    private Filter myFilter = new Filter() {
        @Override
        protected FilterResults performFiltering(CharSequence constraint) {
            FilterResults filterResults = new FilterResults();
            ArrayList<JSONObject> filteredList = new ArrayList<JSONObject>();
            // constraint (query) is the result from text you want to filter against
            // objects is your data set you will filter from
            if (allObjects != null) {
                if (constraint == null || constraint.length() == 0) {
                    filteredList.addAll(allObjects);
                } else {
                    for (int i = 0; i < allObjects.size(); i++) {
                        JSONObject object = allObjects.get(i);
                        String objectTitle = "";
                        try {
                            objectTitle = allObjects.get(i).getString("title");
                            if (objectTitle.toLowerCase().contains(constraint.toString().toLowerCase().trim())) {
                                filteredList.add(object);
                            };
                        } catch (JSONException e) {
                            e.printStackTrace();
                        }
                    }
                }
            }

            // following two lines is very important
            // as publish result can only take FilterResults objects
            filterResults.values = filteredList;
            filterResults.count = filteredList.size();
            return filterResults;
        }

        @Override
        protected void publishResults(CharSequence constraint, FilterResults results) {
            clear();
            addAll((ArrayList<JSONObject>) results.values);

            if (results.count > 0) {
                notifyDataSetChanged();
            } else {
                notifyDataSetInvalidated();
            }
        }

        @Override
        public CharSequence convertResultToString(Object resultValue) {
            try {
                return ((JSONObject) resultValue).getString("title");
            } catch (JSONException e) {
                e.printStackTrace();
            }
            return null;
        }
    };

    @Override
    public Filter getFilter() {
        return myFilter;
    }

//    @Override
//    public JSONObject getItemAtPosition() {
//        return myFilter;
//    }
}
