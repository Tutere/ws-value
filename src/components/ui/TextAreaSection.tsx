import { Label } from "@radix-ui/react-label";
import { Button } from "./Button";
import { Input } from "./Input";
import { InfoIcon } from "./infoIcon";
import { FieldValues, Path, UseFormReturn } from "react-hook-form";
import { Textarea } from "./TextArea";

interface TextAreaProps<T extends FieldValues> {
  infoContent: string;
  methods: UseFormReturn<T, any>;
  label: string;
  methodsField: Path<T>;
  placeHolder: string;
  defaultValue: string;
  required: boolean;
}

export function TextAreaSection<T extends FieldValues>(
  props: TextAreaProps<T>
) {
  return (
    <div className="grid w-full max-w-md items-center gap-1.5">
      <div className="flex">
        <Label htmlFor={props.methodsField.toString()}>{props.label}</Label>
        <p className="text-red-600 ml-auto mr-10"> {props.required? "* required" : ""}</p>
      </div>
      <div className="flex items-center">
        <Textarea
          {...props.methods.register(props.methodsField)}
          className="mr-4"
          placeholder={props.placeHolder}
          defaultValue={props.defaultValue}
        />
        <InfoIcon content={props.infoContent} />
      </div>
      {props.methods.formState.errors[props.methodsField]?.message && (
        <p className="text-red-700">
          {props.methods.formState.errors[
            props.methodsField
          ]?.message?.toString()}
        </p>
      )}
    </div>
  );
}
