import {
  Box,
  TextField,
  Button,
  InputAdornment,
  Typography,
} from "@material-ui/core";
import { FormEvent, useState } from "react";
import { BigNumberish, utils } from "ethers";
import styled from "styled-components";

import WethContract from "../../containers/WethContract";
import Connection from "../../containers/Connection";
import { useEtherscanUrl } from "../../utils/useEtherscanUrl";

enum ACTION_TYPE {
  WRAP,
  UNWRAP,
}

const Link = styled.a`
  color: white;
  font-size: 14px;
`;

const MaxLink = styled.div`
  text-decoration-line: underline;
  color: var(--link-text);
`;

const TokenIcon = styled.img`
  width: 20px;
  height: 20px;
  margin-right: 13px;
`;

const TokenName = styled.div`
  display: flex;
  align-items: center;
`;

const IconAndNameContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const TokenBalance = styled.div`
  display: flex;
  align-items: center;
  text-align: center;
`;

const BalanceElement = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  color: var(--highlighted-selector-text);
  padding: 0px 30px 0px 30px;
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  line-height: 22px;
  margin-top: 20px;
`;

const InputElement = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  color: var(--highlighted-selector-text);
  padding: 0px 30px 0px 30px;
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  line-height: 22px;
  margin-top: 20px;
`;

const Weth = () => {
  const {
    contract: weth,
    wethBalance,
    ethBalance,
  } = WethContract.useContainer();
  const { signer } = Connection.useContainer();

  const [ethAmount, setEthAmount] = useState<BigNumberish | null>(null);
  const [wethAmount, setWethAmount] = useState<BigNumberish | null>(null);
  const [hash, setHash] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const etherscanUrl = useEtherscanUrl(hash);

  const _submitTxn = async (
    amount: BigNumberish | null,
    action: ACTION_TYPE
  ) => {
    if (weth) {
      if (amount && utils.parseEther(amount as string).gt(0)) {
        alert(action === ACTION_TYPE.WRAP ? "Wrapping!" : "Unwrapping!");

        setHash(null);
        setSuccess(null);
        setError(null);

        try {
          let tx;
          if (action === ACTION_TYPE.WRAP) {
            tx = await weth.deposit({
              value: utils.parseEther(amount as string),
            });
          } else {
            tx = await weth.withdraw(
              utils.parseEther(amount as string).toString()
            );
          }
          setHash(tx.hash as string);
          await tx.wait();
          setSuccess(true);
        } catch (error) {
          console.error(error);
          setError(error);
        }
      }
    } else {
      setError(new Error("Please check that you are connected."));
    }
  };

  const handleClick = (e: FormEvent, action: ACTION_TYPE) => {
    e.preventDefault();

    switch (action) {
      case ACTION_TYPE.WRAP:
        _submitTxn(ethAmount, ACTION_TYPE.WRAP);
        break;
      case ACTION_TYPE.UNWRAP:
        _submitTxn(wethAmount, ACTION_TYPE.UNWRAP);
        break;
      default:
        alert("Invalid action!");
    }
  };

  const handleMax = () => {
    setWethAmount(wethBalance ? wethBalance.toString() : null);
  };

  if (!signer) {
    return (
      <Box>
        <Typography>
          <i>Please connect first.</i>
        </Typography>
      </Box>
    );
  }

  return (
    <Box py={4}>
      <Box pt={4}>
        <BalanceElement>
          <IconAndNameContainer>
            <TokenIcon src="https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png" />
            <TokenName>ETH</TokenName>
          </IconAndNameContainer>
          <TokenBalance>{ethBalance}</TokenBalance>
        </BalanceElement>
        <InputElement>
          <form
            noValidate
            autoComplete="off"
            onSubmit={(e) => handleClick(e, ACTION_TYPE.WRAP)}
          >
            <TextField
              type="number"
              label="ETH"
              value={ethAmount ? ethAmount : ""}
              onChange={(e) => setEthAmount(e.target.value)}
              variant="outlined"
              helperText="Keep some ETH unwrapped for transaction fees"
              InputLabelProps={{
                shrink: true,
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Button type="submit" variant="contained">
                      Wrap
                    </Button>
                  </InputAdornment>
                ),
              }}
            />
          </form>
        </InputElement>
      </Box>
      <Box pt={4}>
        <BalanceElement>
          <IconAndNameContainer>
            <TokenIcon src="https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png" />
            <TokenName>WETH</TokenName>
          </IconAndNameContainer>
          <TokenBalance>{wethBalance}</TokenBalance>
        </BalanceElement>
        <InputElement>
          <form
            noValidate
            autoComplete="off"
            onSubmit={(e) => handleClick(e, ACTION_TYPE.UNWRAP)}
          >
            <TextField
              type="number"
              label="WETH"
              value={wethAmount ? wethAmount : ""}
              onChange={(e) => setWethAmount(e.target.value)}
              variant="outlined"
              InputLabelProps={{
                shrink: true,
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Button onClick={() => handleMax()}>
                      <MaxLink>Max</MaxLink>
                    </Button>
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Button type="submit" variant="contained">
                      Unwrap
                    </Button>
                  </InputAdornment>
                ),
              }}
            />
          </form>
        </InputElement>
      </Box>
      {hash && (
        <Box py={4}>
          <Typography>
            <strong>Tx Receipt: </strong>
            {etherscanUrl ? (
              <Link
                href={etherscanUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {hash}
              </Link>
            ) : (
              hash
            )}
          </Typography>
        </Box>
      )}
      {success && (
        <Box py={4}>
          <Typography>
            <strong>Transaction successful!</strong>
          </Typography>
        </Box>
      )}
      {error && (
        <Box py={2}>
          <Typography>
            <span style={{ color: "red" }}>{error.message}</span>
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Weth;