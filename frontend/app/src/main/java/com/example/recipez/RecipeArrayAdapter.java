package com.example.recipez;

import android.content.Context;
import android.util.Log;
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

import java.lang.reflect.Array;
import java.util.ArrayList;
import java.util.Locale;

public class RecipeArrayAdapter extends ArrayAdapter<Recipe> implements Filterable {
    final static String TAG = "RecipeArrayAdapter";

    private Context mContext;
    private int mResource;
    private ArrayList<Recipe> mObjects;
    private ArrayList<Recipe> allObjects;

    public RecipeArrayAdapter(@NonNull Context context, int resource, @NonNull ArrayList<Recipe> objects) {
        super(context, resource, objects);
        this.mContext = context;
        this.mResource = resource;
        this.mObjects = objects;
        allObjects = new ArrayList<>(objects);
    }

    @NonNull
    @Override
    public View getView(int position, @Nullable View convertView, @NonNull ViewGroup parent) {
        LayoutInflater layoutInflator = LayoutInflater.from(mContext);
        convertView = layoutInflator.inflate(mResource, parent, false);

        ImageView imageView = convertView.findViewById(R.id.recipe_image);
        TextView textView = convertView.findViewById(R.id.recipe_title);

        Picasso.get().load(getItem(position).imageUrl).resize(60, 60).centerCrop().into(imageView);
        textView.setText(getItem(position).title);

        return convertView;
    }

    private Filter myFilter = new Filter() {
        @Override
        protected FilterResults performFiltering(CharSequence constraint) {
            FilterResults filterResults = new FilterResults();
            ArrayList<Recipe> filteredList = new ArrayList<Recipe>();
            // constraint (query) is the result from text you want to filter against
            // objects is your data set you will filter from

            if (allObjects != null) {
                if (constraint == null || constraint.length() == 0) {
                    filteredList.addAll(allObjects);
                } else {
                    for (int i = 0; i < allObjects.size(); i++) {
                        Recipe recipe = allObjects.get(i);
                        String recipeTitle = allObjects.get(i).title;

                        if (recipeTitle.toLowerCase().contains(constraint.toString().toLowerCase().trim())) {
                            filteredList.add(recipe);
                        };
                    }

                    Log.d(TAG, String.valueOf(filteredList.size()));
                    for (int i = 0; i < filteredList.size(); i++) {
                        Log.d(TAG, filteredList.get(i).title);
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
            addAll((ArrayList<Recipe>) results.values);

            if (results.count > 0) {
                notifyDataSetChanged();
            } else {
                notifyDataSetInvalidated();
            }
        }

        @Override
        public CharSequence convertResultToString(Object resultValue) {
            return ((Recipe) resultValue).title;
        }
    };

    @Override
    public Filter getFilter() {
        return myFilter;
    }

//    @Override
//    public Recipe getItemAtPosition() {
//        return myFilter;
//    }
}
