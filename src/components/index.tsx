import AWS from "aws-sdk";
import { NextPage } from "next";
import React, { ChangeEvent, memo } from "react";

interface CardProps {
  children: React.ReactNode;
}
interface CardHeaderProps {
  title: string;
}
interface ChatMessage {
  _id: object;
  title?: string;
  createdAt: string;
}
interface UploadResponse {
  Location: string;
}
interface CardFormProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  Location: string;
  submit: () => void;
}

interface ListItemProps {
  item: ChatMessage;
}

const prependZero = (val: number): string => {
  if (String(val).length === 1) {
    return "0" + val;
  }
  return String(val);
};

function formatJSONDate(date: string): string {
  //helper functions

  const today = new Date();

  const thatTime = new Date(date);

  return (
    thatTime.toISOString().slice(0, 10) +
    " " +
    prependZero(thatTime.getHours()) +
    ":" +
    prependZero(thatTime.getMinutes()) +
    ":" +
    prependZero(thatTime.getSeconds())
  );
}

export const Card: NextPage<CardProps> = ({ children }) => {
  return (
    <div className="h-screen flex flex-col justify-center items-center bg-slate-100">
      {children}
    </div>
  );
};

export const CardContent: NextPage<CardProps> = ({ children }) => {
  return (
    <div className="bg-white w-5/6 md:w-4/6 lg:w-3/6 xl:w-2/6 rounded-lg drop-shadow-md min-height">
      {children}
    </div>
  );
};

export const CardHeader: NextPage<CardHeaderProps> = ({ title }) => {
  return (
    <div className="flex flex-row items-center justify-between p-3 border-b border-slate-200">
      <div className="flex flex-row items-center justify-between">
        <h1 className="text-base text-lg tracking-wide text-gray-900 mr-2">
          {title}
        </h1>
      </div>
    </div>
  );
};

// Components for the list
export const List: NextPage<CardProps> = ({ children }) => {
  return <div className="overflow-y-auto h-80 bg-slate-200 ">{children}</div>;
};

const ListItemComponent: NextPage<ListItemProps> = ({ item }) => {
  return (
    <div className="box sb2 ">
      <h1 className="text-white tracking-wide text-sm ">{item.title}</h1>
      <h6>
        <sub className="mt-3">{formatJSONDate(item.createdAt)}</sub>
      </h6>
    </div>
  );
};

export const ListItem = memo(ListItemComponent);

// Form to add new elements to the list

export const CardForm: NextPage<CardFormProps> = ({
  value,
  onChange,
  submit,
  Location,
}) => {
  const [imageUrl, setImageUrl] = React.useState<string>("");
  process.env.AWS_SDK_LOAD_CONFIG = "1";
  const s3 = new AWS.S3({
    accessKeyId: "aws access id",
    secretAccessKey: "secretAccessId Key",
    region: "your region",
  });

  const uploadImageToS3 = async (file: File): Promise<string> => {
    const params = {
      Bucket: "you bucket",
      Key: `images/${file.name}`,
      Body: file,
      ACL: "public-read",
    };

    const { Location } = (await s3.upload(params).promise()) as UploadResponse;

    return Location;
  };

  const handleImageChange = async (file: File) => {
    const url = await uploadImageToS3(file);
    setImageUrl(url);
  };

  return (
    <div className="bg-white w-5/6 md:w-4/6 lg:w-3/6 xl:w-2/6 rounded-lg drop-shadow-md mt-4">
      <div className="relative">
        <textarea
          className="w-full py-4 pl-3 pr-16 text-sm typein"
          placeholder="Enter Message..."
          onChange={onChange}
          value={value}
        ></textarea>

        <button
          className="absolute p-2 text-white -translate-y-1/2 bg-blue-600 top-1/3 right-4"
          type="button"
          onClick={submit}
          style={{ backgroundColor: !value ? "#9ac2df" : undefined }}
        >
          Send
        </button>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleImageChange(file);
            }
          }}
          className="block m-2 w-half text-sm text-gray-900 border border-gray-300  cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
          aria-describedby="file_input_help"
          id="file_input"
        />
        <p
          className="ml-2 mb-1 text-sm text-gray-500 dark:text-gray-300"
          id="file_input_help"
        >
          SVG, PNG, JPG or GIF
        </p>
      </div>
    </div>
  );
};
