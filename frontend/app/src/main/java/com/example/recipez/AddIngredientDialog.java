package com.example.recipez;

import android.app.Dialog;
import android.content.Context;
import android.content.DialogInterface;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.EditText;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatDialogFragment;

public class AddIngredientDialog extends AppCompatDialogFragment {
    private EditText editIngredientName;
    private EditText editIngredientExpiry;
    private AddIngredientListener listener;

    @NonNull
    @Override
    public Dialog onCreateDialog(@Nullable Bundle savedInstanceState) {
        AlertDialog.Builder builder = new AlertDialog.Builder(getActivity());

        LayoutInflater inflater = getActivity().getLayoutInflater();
        View view = inflater.inflate(R.layout.dialog_add_ingredient, null);

        builder.setView(view)
                .setTitle("Add Ingredient")
                .setNegativeButton("cancel", new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int which) {

                    }
                })
                .setPositiveButton("ok", new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int which) {
                        String name = editIngredientName.getText().toString();
                        String expiry = editIngredientExpiry.getText().toString();
                        listener.addIngredient(name, expiry);
                    }
                });

        editIngredientName = view.findViewById(R.id.editIngredientName);
        editIngredientExpiry = view.findViewById(R.id.editIngredientExpiry);

        return builder.create();
    }

    @Override
    public void onAttach(@NonNull Context context) {
        super.onAttach(context);

        try {
            listener = (AddIngredientListener) getActivity();
        } catch (ClassCastException e) {
            throw new ClassCastException(context.toString() + ": must implement AddIngredientListener");
        }
    }

    public interface AddIngredientListener {
        void addIngredient(String name, String expiry);
    }
}
