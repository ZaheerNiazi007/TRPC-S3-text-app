import {
  Card,
  CardContent,
  CardForm,
  CardHeader,
  List,
  ListItem,
} from "../components";
// import { .... } from "@prisma/client";
import type { NextPage } from "next";
import Head from "next/head";
import { useCallback, useState, useRef, useEffect } from "react";
import { trpc } from "../utils/trpc";

const Home: NextPage = () => {
  const [itemName, setItemName] = useState<string>("");
  const scrollRef = useRef<HTMLElement>(null);

  const { data: list, refetch, isLoading } = trpc.useQuery(["msg.list"]);
  const insertMutation = trpc.useMutation(["msg.add"], {
    onSuccess: () => {
      refetch();
    },
  });

  useEffect(() => {
    if (scrollRef?.current) {
      scrollRef.current.scrollIntoView();
    }
  }, [list]);

  const sendMessage = useCallback(() => {
    if (itemName === "") return;

    insertMutation.mutate({
      title: itemName,
    });

    setItemName("");
  }, [itemName, insertMutation]);

  return (
    <>
      <Head>
        <title>TRPC+S3 text app</title>
        <meta name="description" content="TRPC CHAT APP" />
      </Head>

      <main>
        <Card>
          <CardContent>
            <CardHeader title="TRPC+S3 text app" />
            {isLoading ? (
              <span className="p-2">Hold on.. fetching chats...</span>
            ) : (
              <List>
                {list?.map((item) => (
                  <ListItem key={item._id.toString()} item={item} />
                ))}
                <span ref={scrollRef} />
              </List>
            )}
          </CardContent>
          <CardForm
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            submit={sendMessage}
            Location={""}
          />
        </Card>
      </main>
    </>
  );
};

export default Home;
