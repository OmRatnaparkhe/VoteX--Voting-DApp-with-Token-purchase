import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const TokenPrice = ({ tokenPrice }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Current Token Price</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-slate-900">
          {tokenPrice ? tokenPrice : "0"} <span className="text-sm font-normal text-slate-500">ETH</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default TokenPrice;