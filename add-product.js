const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const newProductHTML = `          </a>
          <!-- Product 3: Energy Monitoring -->
          <a href="/energy-monitoring" target="_blank" class="innovation-card">
            <div class="innovation-card-img">
              <img src="img/energy-monitoring.jpeg" alt="Energy Monitoring">
              <div class="innovation-card-badge" style="background: #10b981;">New Product</div>
            </div>
            <div class="innovation-card-body">
              <h3 class="innovation-card-title">Energy Monitoring</h3>
              <p class="innovation-card-subtitle">Smart Monitoring for Smarter Energy Decisions</p>
              <p class="innovation-card-desc">Detailed insights into energy consumption patterns across your facility. Identify inefficiencies, optimize usage, reduce energy costs, and enhance sustainability.</p>
              <div class="innovation-card-tags">
                <span>Energy Savings</span>
                <span>Sustainability</span>
                <span>Real-Time Analytics</span>
                <span>Cost Optimization</span>
              </div>
              <div class="innovation-card-cta">
                Learn More
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </div>
            </div>
          </a>
        </div>
      </div>
    </section>`;

// using split and join to bypass newline mismatch
const parts = content.split('          </a>\r\n        </div>\r\n      </div>\r\n    </section>');
if (parts.length === 2) {
  content = parts[0] + newProductHTML + parts[1];
  fs.writeFileSync('index.html', content);
  console.log('Product added successfully to index.html using CRLF');
} else {
  const parts2 = content.split('          </a>\n        </div>\n      </div>\n    </section>');
  if (parts2.length === 2) {
    content = parts2[0] + newProductHTML + parts2[1];
    fs.writeFileSync('index.html', content);
    console.log('Product added successfully to index.html using LF');
  } else {
    console.log('Failed to find the insertion point');
  }
}
